import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateForumMessageDto } from './dto/create-forum-message.dto';
import { UpdateForumMessageDto } from './dto/update-forum-message.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ForumMessage } from './entities/forum-message.entity';
import { ForumReport } from './entities/forum-report.entity';
import { ContentFilterService } from './content-filter.service';

@Injectable()
export class ForumMessageService {
  constructor(
    @InjectRepository(ForumMessage)
    private readonly forumMessageRepository: Repository<ForumMessage>,
    @InjectRepository(ForumReport)
    private readonly forumReportRepository: Repository<ForumReport>,
    private readonly contentFilter: ContentFilterService,
  ) {}

  async create(
    createForumMessageDto: CreateForumMessageDto,
  ): Promise<ForumMessage> {
    const sanitized = this.contentFilter.sanitize(
      createForumMessageDto.content,
    );
    const check = await this.contentFilter.validate(sanitized);
    if (!check.ok) {
      throw new BadRequestException(`Content rejected: ${check.reason}`);
    }

    const message = this.forumMessageRepository.create({
      content: sanitized,
      topic: { topic_id: createForumMessageDto.idTopic } as any,
      user: { idUser: createForumMessageDto.idUser } as any,
    });

    return await this.forumMessageRepository.save(message);
  }

  async findAll(): Promise<ForumMessage[]> {
    return await this.forumMessageRepository.find({
      relations: ['user', 'topic'],
      order: { sent_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ForumMessage> {
    const message = await this.forumMessageRepository.findOne({
      where: { message_id: id },
      relations: ['user', 'topic'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async update(
    id: number,
    updateForumMessageDto: UpdateForumMessageDto,
  ): Promise<ForumMessage> {
    const message = await this.findOne(id);

    if (updateForumMessageDto.content) {
      const sanitized = this.contentFilter.sanitize(
        updateForumMessageDto.content,
      );
      const check = await this.contentFilter.validate(sanitized);
      if (!check.ok) {
        throw new BadRequestException(`Content rejected: ${check.reason}`);
      }
      updateForumMessageDto.content = sanitized;
    }

    Object.assign(message, updateForumMessageDto);

    return await this.forumMessageRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const result = await this.forumMessageRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }

  async moderatorRemove(id: number): Promise<void> {
    const message = await this.findOne(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    await this.forumMessageRepository.delete(id);
  }

  async findByTopic(topicId: number): Promise<ForumMessage[]> {
    return await this.forumMessageRepository.find({
      where: { topic: { topic_id: topicId } as any },
      relations: ['user'],
      order: { sent_at: 'ASC' },
    });
  }

  async createReport(dto: CreateReportDto): Promise<ForumReport> {
    const existing = await this.forumReportRepository.findOne({
      where: {
        reporter: { idUser: dto.idReporter },
        ...(dto.idMessage ? { message: { message_id: dto.idMessage } } : {}),
        ...(dto.idTopic ? { topic: { topic_id: dto.idTopic } } : {}),
        status: 'pending' as const,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already reported this content');
    }

    const report = this.forumReportRepository.create({
      reason: dto.reason,
      details: dto.details,
      reporter: { idUser: dto.idReporter } as any,
      message: dto.idMessage
        ? ({ message_id: dto.idMessage } as any)
        : undefined,
      topic: dto.idTopic ? ({ topic_id: dto.idTopic } as any) : undefined,
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
