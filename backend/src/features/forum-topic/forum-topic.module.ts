import { Module } from '@nestjs/common';
import { ForumTopicService } from './forum-topic.service';
import { ForumTopicController } from './forum-topic.controller';

@Module({
  controllers: [ForumTopicController],
  providers: [ForumTopicService],
})
export class ForumTopicModule {}
