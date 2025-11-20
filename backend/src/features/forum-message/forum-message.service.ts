import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateForumMessageDto } from './dto/create-forum-message.dto';
import { UpdateForumMessageDto } from './dto/update-forum-message.dto';
import { ForumMessage } from './entities/forum-message.entity';

@Injectable()
export class ForumMessageService {
  constructor(
    @InjectRepository(ForumMessage)
    private readonly forumMessageRepository: Repository<ForumMessage>,
  ) {}

  async create(createForumMessageDto: CreateForumMessageDto): Promise<ForumMessage> {
    const message = this.forumMessageRepository.create({
      content: createForumMessageDto.content,
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

  async update(id: number, updateForumMessageDto: UpdateForumMessageDto): Promise<ForumMessage> {
    const message = await this.findOne(id);
    
    Object.assign(message, updateForumMessageDto);
    
    return await this.forumMessageRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const result = await this.forumMessageRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }

  async findByTopic(topicId: number): Promise<ForumMessage[]> {
    return await this.forumMessageRepository.find({
      where: { topic: { topic_id: topicId } as any },
      relations: ['user'],
      order: { sent_at: 'ASC' },
    });
  }
}
