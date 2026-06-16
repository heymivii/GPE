import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

  async create(createForumTopicDto: CreateForumTopicDto): Promise<ForumTopic> {
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
      user: { idUser: createForumTopicDto.userId } as any,
      country: createForumTopicDto.countryId
        ? ({ idCountry: createForumTopicDto.countryId } as any)
        : undefined,
    });

    const savedTopic = await this.forumTopicRepository.save(topic);

    const initialMessage = this.forumMessageRepository.create({
      content: sanitizedContent,
      topic: { idForumTopic: savedTopic.idForumTopic } as any,
      user: { idUser: createForumTopicDto.userId } as any,
    });

    await this.forumMessageRepository.save(initialMessage);

    return savedTopic;
  }
  async findAll(): Promise<ForumTopic[]> {
    return await this.forumTopicRepository.find({
      relations: ['user', 'country'],
      order: { createdAt: 'DESC' },
    });
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

  async update(
    id: number,
    updateForumTopicDto: UpdateForumTopicDto,
  ): Promise<ForumTopic> {
    const topic = await this.findOne(id);

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

  async moderatorRemove(id: number): Promise<void> {
    const topic = await this.findOne(id);
    await this.forumTopicRepository.remove(topic);
  }

  async remove(id: number): Promise<void> {
    const result = await this.forumTopicRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }
}
