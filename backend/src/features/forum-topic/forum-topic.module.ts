import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumTopicService } from './forum-topic.service';
import { ForumTopicController } from './forum-topic.controller';
import { ForumTopic } from './entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ForumTopic, ForumMessage])],
  controllers: [ForumTopicController],
  providers: [ForumTopicService],
  exports: [ForumTopicService],
})
export class ForumTopicModule {}
