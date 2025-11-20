import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumMessageService } from './forum-message.service';
import { ForumMessageController } from './forum-message.controller';
import { ForumMessage } from './entities/forum-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ForumMessage])],
  controllers: [ForumMessageController],
  providers: [ForumMessageService],
  exports: [ForumMessageService],
})
export class ForumMessageModule {}
