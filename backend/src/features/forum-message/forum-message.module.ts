import { Module } from '@nestjs/common';
import { ForumMessageService } from './forum-message.service';
import { ForumMessageController } from './forum-message.controller';

@Module({
  controllers: [ForumMessageController],
  providers: [ForumMessageService],
})
export class ForumMessageModule {}
