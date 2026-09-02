import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateForumMessageDto } from './dto/create-forum-message.dto';
import { UpdateForumMessageDto } from './dto/update-forum-message.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ForumMessage } from './entities/forum-message.entity';
import { ForumReport } from './entities/forum-report.entity';
import { ForumTopicFollow } from '../forum-topic/entities/forum-topic-follow.entity';
import { ContentFilterService } from './content-filter.service';
import { ForumModerationService } from '../forum-moderation/forum-moderation.service';
import { NotificationService } from '../notification/notification.service';
import { maskModerated, maskModeratedList } from './moderation-mask';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';

@Injectable()
export class ForumMessageService {
  constructor(
    @InjectRepository(ForumMessage)
    private readonly forumMessageRepository: Repository<ForumMessage>,
    @InjectRepository(ForumReport)
    private readonly forumReportRepository: Repository<ForumReport>,
    @InjectRepository(ForumTopicFollow)
    private readonly followRepository: Repository<ForumTopicFollow>,
    private readonly contentFilter: ContentFilterService,
    private readonly moderation: ForumModerationService,
    private readonly notifications: NotificationService,
  ) {}

  /** Prévient les abonnés d'un topic qu'un nouveau message y a été publié (jamais l'auteur). */
  private async notifyFollowers(
    topicId: number,
    authorId: number,
  ): Promise<void> {
    try {
      const follows = await this.followRepository.find({ where: { topicId } });
      const recipients = follows
        .map((f) => f.userId)
        .filter((uid) => uid !== authorId);
      await Promise.all(
        recipients.map((uid) =>
          this.notifications.create({
            userId: uid,
            notificationType: 'info',
            message:
              '💬 Nouveau message dans une discussion que vous suivez.',
            contextType: 'forum-topic',
            contextId: topicId,
          } as CreateNotificationDto),
        ),
      );
    } catch {
      // Les notifications ne doivent jamais empêcher la publication d'un message.
    }
  }

  async create(
    userId: number,
    createForumMessageDto: CreateForumMessageDto,
  ): Promise<ForumMessage> {
    const sanitized = this.contentFilter.sanitize(
      createForumMessageDto.content,
    );
    const check = await this.contentFilter.validate(sanitized);
    if (!check.ok) {
      throw new BadRequestException(`Content rejected: ${check.reason}`);
    }

    // Modération pilotée par la liste admin (mots interdits) : TOUT mot de la liste,
    // quelle que soit sa sévérité, refuse le message → il n'est jamais affiché.
    // (moderate() enregistre malgré tout un avertissement pour tracer l'auteur.)
    const mod = await this.moderation.moderate(userId, sanitized);
    if (mod.action !== 'ok') {
      throw new BadRequestException(`Content rejected: ${mod.reason}`);
    }

    const message = this.forumMessageRepository.create({
      content: sanitized,
      topic: { idForumTopic: createForumMessageDto.topicId } as any,
      user: { idUser: userId } as any,
    });

    const saved = await this.forumMessageRepository.save(message);
    // Bonus F2 : prévenir les abonnés du topic (sauf l'auteur).
    await this.notifyFollowers(createForumMessageDto.topicId, userId);
    return saved;
  }

  async findAll(): Promise<ForumMessage[]> {
    const messages = await this.forumMessageRepository.find({
      relations: ['user', 'topic'],
      order: { sentAt: 'DESC' },
    });
    return maskModeratedList(messages);
  }

  /**
   * Variante exposée par l'API. `findOne` reste non masquée : elle sert aux
   * contrôles de droits internes (update/remove), qui ont besoin du contenu réel.
   */
  async findOnePublic(id: number): Promise<ForumMessage> {
    return maskModerated(await this.findOne(id));
  }

  async findOne(id: number): Promise<ForumMessage> {
    const message = await this.forumMessageRepository.findOne({
      where: { idForumMessage: id },
      relations: ['user', 'topic'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async update(
    id: number,
    userId: number,
    updateForumMessageDto: UpdateForumMessageDto,
  ): Promise<ForumMessage> {
    const message = await this.findOne(id);
    if (message.user?.idUser !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos messages');
    }

    if (updateForumMessageDto.content) {
      const sanitized = this.contentFilter.sanitize(
        updateForumMessageDto.content,
      );
      const check = await this.contentFilter.validate(sanitized);
      if (!check.ok) {
        throw new BadRequestException(`Content rejected: ${check.reason}`);
      }
      // Même règle qu'à la création : un mot interdit inséré à l'édition = refusé.
      const mod = await this.moderation.moderate(userId, sanitized);
      if (mod.action !== 'ok') {
        throw new BadRequestException(`Content rejected: ${mod.reason}`);
      }
      updateForumMessageDto.content = sanitized;
    }

    Object.assign(message, updateForumMessageDto);

    return await this.forumMessageRepository.save(message);
  }

  async remove(id: number, userId: number): Promise<void> {
    const message = await this.findOne(id);
    if (message.user?.idUser !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos messages');
    }
    await this.forumMessageRepository.delete(id);
  }

  async moderatorRemove(id: number): Promise<void> {
    const message = await this.findOne(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    await this.forumMessageRepository.delete(id);
  }

  async findByTopic(topicId: number): Promise<ForumMessage[]> {
    const messages = await this.forumMessageRepository.find({
      where: { topic: { idForumTopic: topicId } as any },
      relations: ['user'],
      order: { sentAt: 'ASC' },
    });
    return maskModeratedList(messages);
  }

  async createReport(
    reporterId: number,
    dto: CreateReportDto,
  ): Promise<ForumReport> {
    const existing = await this.forumReportRepository.findOne({
      where: {
        reporter: { idUser: reporterId },
        ...(dto.messageId ? { message: { idForumMessage: dto.messageId } } : {}),
        ...(dto.topicId ? { topic: { idForumTopic: dto.topicId } } : {}),
        status: 'pending' as const,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already reported this content');
    }

    const report = this.forumReportRepository.create({
      reason: dto.reason,
      details: dto.details,
      reporter: { idUser: reporterId } as any,
      message: dto.messageId
        ? ({ idForumMessage: dto.messageId } as any)
        : undefined,
      topic: dto.topicId ? ({ idForumTopic: dto.topicId } as any) : undefined,
    });

    return await this.forumReportRepository.save(report);
  }

  async findAllReports(status?: string): Promise<ForumReport[]> {
    const where = status ? { status: status as any } : {};
    return await this.forumReportRepository.find({
      where,
      relations: [
        'reporter',
        'message',
        'message.user',
        'topic',
        'topic.user',
        'moderator',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async resolveReport(
    reportId: number,
    moderatorId: number,
    action: 'resolved' | 'rejected',
    moderatorNote?: string,
  ): Promise<ForumReport> {
    const report = await this.forumReportRepository.findOne({
      where: { idReport: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    report.status = action;
    report.moderatorNote = moderatorNote || null;
    report.resolvedAt = new Date();
    report.moderator = { idUser: moderatorId } as any;

    return await this.forumReportRepository.save(report);
  }

  async getReportStats(): Promise<{
    pending: number;
    resolved: number;
    rejected: number;
    total: number;
  }> {
    const [pending, resolved, rejected] = await Promise.all([
      this.forumReportRepository.count({ where: { status: 'pending' } }),
      this.forumReportRepository.count({ where: { status: 'resolved' } }),
      this.forumReportRepository.count({ where: { status: 'rejected' } }),
    ]);
    return {
      pending,
      resolved,
      rejected,
      total: pending + resolved + rejected,
    };
  }
}
