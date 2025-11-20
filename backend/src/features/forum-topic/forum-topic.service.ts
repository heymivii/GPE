import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateForumTopicDto } from './dto/create-forum-topic.dto';
import { UpdateForumTopicDto } from './dto/update-forum-topic.dto';
import { ForumTopic } from './entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';

@Injectable()
export class ForumTopicService {
  constructor(
    @InjectRepository(ForumTopic)
    private readonly forumTopicRepository: Repository<ForumTopic>,
    @InjectRepository(ForumMessage)
    private readonly forumMessageRepository: Repository<ForumMessage>,
  ) {}

  async create(createForumTopicDto: CreateForumTopicDto): Promise<ForumTopic> {
    const topic = this.forumTopicRepository.create({
      title: createForumTopicDto.title,
      category: createForumTopicDto.category,
      user: { idUser: createForumTopicDto.idUser } as any,
      country: createForumTopicDto.idCountry 
        ? ({ id_country: createForumTopicDto.idCountry } as any)
        : undefined,
    });
    
    const savedTopic = await this.forumTopicRepository.save(topic);

    const initialMessage = this.forumMessageRepository.create({
      content: createForumTopicDto.content.trim(),
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
    
    if (updateForumTopicDto.title) topic.title = updateForumTopicDto.title;
    if (updateForumTopicDto.category) topic.category = updateForumTopicDto.category;
    
    const updatedTopic = await this.forumTopicRepository.save(topic);

    if (updateForumTopicDto.content !== undefined) {
      const firstMessage = await this.forumMessageRepository.findOne({
        where: { topic: { topic_id: id } },
        order: { sent_at: 'ASC' },
      });

      if (updateForumTopicDto.content.trim()) {
        if (firstMessage) {
          firstMessage.content = updateForumTopicDto.content.trim();
          await this.forumMessageRepository.save(firstMessage);
        } else {
          const newMessage = this.forumMessageRepository.create({
            content: updateForumTopicDto.content.trim(),
            topic: { topic_id: id } as any,
            user: topic.user,
          });
          await this.forumMessageRepository.save(newMessage);
        }
      } else if (firstMessage) {
        await this.forumMessageRepository.remove(firstMessage);
      }
    }
    
    return updatedTopic;
  }

  async remove(id: number): Promise<void> {
    const result = await this.forumTopicRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
  }
}
