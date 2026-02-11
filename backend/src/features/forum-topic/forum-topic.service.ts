import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const titleFilter = await this.contentFilterService.validate(createForumTopicDto.title);
    if (!titleFilter.ok) {
      throw new BadRequestException(`Topic title rejected: ${titleFilter.reason}`);
    }

    const contentFilter = await this.contentFilterService.validate(createForumTopicDto.content);
    if (!contentFilter.ok) {
      throw new BadRequestException(`Topic content rejected: ${contentFilter.reason}`);
    }

    const sanitizedTitle = this.contentFilterService.sanitize(createForumTopicDto.title);
    const sanitizedContent = this.contentFilterService.sanitize(createForumTopicDto.content.trim());

    const topic = this.forumTopicRepository.create({
      title: sanitizedTitle,
      category: createForumTopicDto.category,
      user: { idUser: createForumTopicDto.idUser } as any,
      country: createForumTopicDto.idCountry
        ? ({ idCountry: createForumTopicDto.idCountry } as any)
        : undefined,
    });
    
    const savedTopic = await this.forumTopicRepository.save(topic);

    const initialMessage = this.forumMessageRepository.create({
      content: sanitizedContent,
      topic: { topic_id: savedTopic.topic_id } as any,
      user: { idUser: createForumTopicDto.idUser } as any,
    });
    
    await this.forumMessageRepository.save(initialMessage);
    
    return savedTopic;
  }  async findAll(): Promise<ForumTopic[]> {
    return await this.forumTopicRepository.find({
      relations: ['user', 'country'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ForumTopic> {
    const topic = await this.forumTopicRepository.findOne({
      where: { topic_id: id },
      relations: ['user', 'country', 'messages', 'messages.user'],
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    if (topic.messages && topic.messages.length > 0) {
      topic.messages.sort((a, b) => {
        const dateA = new Date(a.sent_at).getTime();
        const dateB = new Date(b.sent_at).getTime();
        return dateA - dateB;
      });
    }

    return topic;
  }

  async update(id: number, updateForumTopicDto: UpdateForumTopicDto): Promise<ForumTopic> {
    const topic = await this.findOne(id);

    if (updateForumTopicDto.title) {
      const titleFilter = await this.contentFilterService.validate(updateForumTopicDto.title);
      if (!titleFilter.ok) {
        throw new BadRequestException(`Topic title rejected: ${titleFilter.reason}`);
      }
      topic.title = this.contentFilterService.sanitize(updateForumTopicDto.title);
    }
    if (updateForumTopicDto.category) topic.category = updateForumTopicDto.category;
    
    const updatedTopic = await this.forumTopicRepository.save(topic);

    if (updateForumTopicDto.content !== undefined) {
      if (updateForumTopicDto.content.trim()) {
        const contentFilter = await this.contentFilterService.validate(updateForumTopicDto.content);
        if (!contentFilter.ok) {
          throw new BadRequestException(`Topic content rejected: ${contentFilter.reason}`);
        }
        const sanitizedContent = this.contentFilterService.sanitize(updateForumTopicDto.content.trim());

        const firstMessage = await this.forumMessageRepository.findOne({
          where: { topic: { topic_id: id } },
          order: { sent_at: 'ASC' },
        });

        if (firstMessage) {
          firstMessage.content = sanitizedContent;
          await this.forumMessageRepository.save(firstMessage);
        } else {
          const newMessage = this.forumMessageRepository.create({
            content: sanitizedContent,
            topic: { topic_id: id } as any,
            user: topic.user,
          });
          await this.forumMessageRepository.save(newMessage);
        }
      } else {
        const firstMessage = await this.forumMessageRepository.findOne({
          where: { topic: { topic_id: id } },
          order: { sent_at: 'ASC' },
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
    topic.is_locked = !topic.is_locked;
    return this.forumTopicRepository.save(topic);
  }

  async pinTopic(id: number): Promise<ForumTopic> {
    const topic = await this.findOne(id);
    topic.is_pinned = !topic.is_pinned;
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
