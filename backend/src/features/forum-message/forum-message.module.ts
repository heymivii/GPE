import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumMessageService } from './forum-message.service';
import { ForumMessageController } from './forum-message.controller';
import { ForumMessage } from './entities/forum-message.entity';
import { ForumReport } from './entities/forum-report.entity';
import { ForumTopicFollow } from '../forum-topic/entities/forum-topic-follow.entity';
import { ContentFilterService } from './content-filter.service';
import { ForumModerationModule } from '../forum-moderation/forum-moderation.module';
import { NotificationModule } from '../notification/notification.module';
import { SupportRatingModule } from '../support-rating/support-rating.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForumMessage, ForumReport, ForumTopicFollow]),
    ForumModerationModule,
    NotificationModule,
    SupportRatingModule,
  ],
  controllers: [ForumMessageController],
  providers: [ForumMessageService, ContentFilterService],
  exports: [ForumMessageService, ContentFilterService],
})
export class ForumMessageModule {}
