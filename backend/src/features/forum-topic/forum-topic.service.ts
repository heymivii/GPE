import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateForumTopicDto } from './dto/create-forum-topic.dto';
import { UpdateForumTopicDto } from './dto/update-forum-topic.dto';
import { ForumTopic } from './entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { ContentFilterService } from '../forum-message/content-filter.service';

@Injectable()
export class ForumTopicService {
  constructor(
    @InjectRepository(ForumTopic)
    private readonly forumTopicRepository: Repository<ForumTopic>,
    @InjectRepository(ForumMessage)
    private readonly forumMessageRepository: Repository<ForumMessage>,
    private readonly contentFilterService: ContentFilterService,
  ) {}

  async create(
    userId: number,
    createForumTopicDto: CreateForumTopicDto,
  ): Promise<ForumTopic> {
    const titleFilter = await this.contentFilterService.validate(
      createForumTopicDto.title,
    );
    if (!titleFilter.ok) {
      throw new BadRequestException(
        `Topic title rejected: ${titleFilter.reason}`,
      );
    }

    const contentFilter = await this.contentFilterService.validate(
      createForumTopicDto.content,
    );
    if (!contentFilter.ok) {
      throw new BadRequestException(
        `Topic content rejected: ${contentFilter.reason}`,
      );
    }

    const sanitizedTitle = this.contentFilterService.sanitize(
      createForumTopicDto.title,
    );
    const sanitizedContent = this.contentFilterService.sanitize(
      createForumTopicDto.content.trim(),
    );

    const topic = this.forumTopicRepository.create({
      title: sanitizedTitle,
      category: createForumTopicDto.category,
      user: { idUser: userId } as any,
      country: createForumTopicDto.countryId
        ? ({ idCountry: createForumTopicDto.countryId } as any)
        : undefined,
    });

    const savedTopic = await this.forumTopicRepository.save(topic);

    const initialMessage = this.forumMessageRepository.create({
      content: sanitizedContent,
      topic: { idForumTopic: savedTopic.idForumTopic } as any,
      user: { idUser: userId } as any,
    });

    await this.forumMessageRepository.save(initialMessage);

    return savedTopic;
  }
  async findAll(): Promise<ForumTopic[]> {
    // loadRelationCountAndMap → chaque topic reçoit messagesCount (compteur de réponses
    // réel), sans charger tous les messages. Avant, le front lisait messages?.length
    // toujours undefined → « 0 réponses » partout.
    return await this.forumTopicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.user', 'user')
      .leftJoinAndSelect('topic.country', 'country')
      .loadRelationCountAndMap('topic.messagesCount', 'topic.messages')
      .orderBy('topic.createdAt', 'DESC')
      .getMany();
  }

  async getStats(): Promise<{
    totalTopics: number;
    totalMessages: number;
    last24h: number;
    byCategory: { category: string; count: number }[];
  }> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalTopics, totalMessages, last24h, byCategoryRaw] =
      await Promise.all([
        this.forumTopicRepository.count(),
        this.forumMessageRepository.count(),
        this.forumTopicRepository.count({
          where: { createdAt: MoreThanOrEqual(since) },
        }),
        this.forumTopicRepository
          .createQueryBuilder('topic')
          .select('topic.category', 'category')
          .addSelect('COUNT(*)', 'count')
          .groupBy('topic.category')
          .getRawMany<{ category: string | null; count: string }>(),
      ]);

    const byCategory = byCategoryRaw.map((row) => ({
      category: row.category ?? 'other',
      count: parseInt(row.count, 10),
    }));

    return { totalTopics, totalMessages, last24h, byCategory };
  }

  async findOne(id: number): Promise<ForumTopic> {
    const topic = await this.forumTopicRepository.findOne({
      where: { idForumTopic: id },
      relations: ['user', 'country', 'messages', 'messages.user'],
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    if (topic.messages && topic.messages.length > 0) {
      topic.messages.sort((a, b) => {
        const dateA = new Date(a.sentAt).getTime();
        const dateB = new Date(b.sentAt).getTime();
        return dateA - dateB;
      });
    }

    return topic;
  }

  /** Lecture publique d'un topic : incrémente le compteur de vues (jamais fait avant). */
  async findOnePublic(id: number): Promise<ForumTopic> {
    await this.forumTopicRepository.increment(
      { idForumTopic: id },
      'viewsCount',
      1,
    );
    return this.findOne(id);
  }

  async update(
    id: number,
    userId: number,
    updateForumTopicDto: UpdateForumTopicDto,
  ): Promise<ForumTopic> {
    const topic = await this.findOne(id);
    if (topic.user?.idUser !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos sujets');
    }

    if (updateForumTopicDto.title) {
      const titleFilter = await this.contentFilterService.validate(
        updateForumTopicDto.title,
      );
      if (!titleFilter.ok) {
        throw new BadRequestException(
          `Topic title rejected: ${titleFilter.reason}`,
        );
      }
      topic.title = this.contentFilterService.sanitize(
        updateForumTopicDto.title,
      );
    }
    if (updateForumTopicDto.category)
      topic.category = updateForumTopicDto.category;

    const updatedTopic = await this.forumTopicRepository.save(topic);

    if (updateForumTopicDto.content !== undefined) {
      if (updateForumTopicDto.content.trim()) {
        const contentFilter = await this.contentFilterService.validate(
          updateForumTopicDto.content,
        );
        if (!contentFilter.ok) {
          throw new BadRequestException(
            `Topic content rejected: ${contentFilter.reason}`,
          );
        }
        const sanitizedContent = this.contentFilterService.sanitize(
          updateForumTopicDto.content.trim(),
        );

        const firstMessage = await this.forumMessageRepository.findOne({
          where: { topic: { idForumTopic: id } },
          order: { sentAt: 'ASC' },
        });

        if (firstMessage) {
          firstMessage.content = sanitizedContent;
          await this.forumMessageRepository.save(firstMessage);
        } else {
          const newMessage = this.forumMessageRepository.create({
            content: sanitizedContent,
            topic: { idForumTopic: id } as any,
            user: topic.user,
          });
          await this.forumMessageRepository.save(newMessage);
        }
      } else {
        const firstMessage = await this.forumMessageRepository.findOne({
          where: { topic: { idForumTopic: id } },
          order: { sentAt: 'ASC' },
        });
        if (firstMessage) {
          await this.forumMessageRepository.remove(firstMessage);
        }
      }
    }

    return updatedTopic;
  }

  async lockTopic(id: number): Promise<ForumTopic> {
    const topic = await this.findOne(id);
    topic.isLocked = !topic.isLocked;
    return this.forumTopicRepository.save(topic);
  }

  async pinTopic(id: number): Promise<ForumTopic> {
    const topic = await this.findOne(id);
    topic.isPinned = !topic.isPinned;
    return this.forumTopicRepository.save(topic);
  }

  // Supprime le topic ET ses messages — forum_message.topic est NOT NULL sans cascade,
  // donc supprimer un topic qui a des messages violait la FK (500).
  private async deleteTopicWithMessages(topic: ForumTopic): Promise<void> {
    await this.forumMessageRepository.delete({
      topic: { idForumTopic: topic.idForumTopic } as any,
    });
    await this.forumTopicRepository.remove(topic);
  }

  /** Modération (admin/mod) : supprime n'importe quel topic. */
  async moderatorRemove(id: number): Promise<void> {
    const topic = await this.findOne(id);
    await this.deleteTopicWithMessages(topic);
  }

  /** Suppression par l'auteur uniquement. */
  async remove(id: number, userId: number): Promise<void> {
    const topic = await this.findOne(id);
    if (topic.user?.idUser !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos sujets');
    }
    await this.deleteTopicWithMessages(topic);
  }
}
