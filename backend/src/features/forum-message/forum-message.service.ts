import { Injectable } from '@nestjs/common';
import { CreateForumMessageDto } from './dto/create-forum-message.dto';
import { UpdateForumMessageDto } from './dto/update-forum-message.dto';

@Injectable()
export class ForumMessageService {
  create(createForumMessageDto: CreateForumMessageDto) {
    return 'This action adds a new forumMessage';
  }

  findAll() {
    return `This action returns all forumMessage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} forumMessage`;
  }

  update(id: number, updateForumMessageDto: UpdateForumMessageDto) {
    return `This action updates a #${id} forumMessage`;
  }

  remove(id: number) {
    return `This action removes a #${id} forumMessage`;
  }
}
