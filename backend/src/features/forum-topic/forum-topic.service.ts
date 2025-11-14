import { Injectable } from '@nestjs/common';
import { CreateForumTopicDto } from './dto/create-forum-topic.dto';
import { UpdateForumTopicDto } from './dto/update-forum-topic.dto';

@Injectable()
export class ForumTopicService {
  create(createForumTopicDto: CreateForumTopicDto) {
    return 'This action adds a new forumTopic';
  }

  findAll() {
    return `This action returns all forumTopic`;
  }

  findOne(id: number) {
    return `This action returns a #${id} forumTopic`;
  }

  update(id: number, updateForumTopicDto: UpdateForumTopicDto) {
    return `This action updates a #${id} forumTopic`;
  }

  remove(id: number) {
    return `This action removes a #${id} forumTopic`;
  }
}
