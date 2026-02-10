import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumMessageService } from './forum-message.service';
import { ForumMessageController } from './forum-message.controller';
import { ForumMessage } from './entities/forum-message.entity';
import { ForumReport } from './entities/forum-report.entity';
import { ContentFilterService } from './content-filter.service';

@Module({
  imports: [TypeOrmModule.forFeature([ForumMessage, ForumReport])],
  controllers: [ForumMessageController],
  providers: [ForumMessageService, ContentFilterService],
  exports: [ForumMessageService, ContentFilterService],
})
export class ForumMessageModule {}
