import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivateMessage } from './entities/private-message.entity';
import { User } from '../user/entities/user.entity';
import { PrivateMessageService } from './private-message.service';
import { PrivateMessageController } from './private-message.controller';
import { ContentFilterService } from '../forum-message/content-filter.service';
import { ForumModerationModule } from '../forum-moderation/forum-moderation.module';
import { BuddyContactRequest } from '../buddy-contact/entities/buddy-contact-request.entity';
import { ProcedureTracking } from '../procedure-tracking/entities/procedure-tracking.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PrivateMessage,
      User,
      BuddyContactRequest,
      ProcedureTracking,
      ExpatriationProject,
    ]),
    // Même liste de mots interdits que le forum : la modération suit le contenu,
    // pas le canal.
    ForumModerationModule,
  ],
  controllers: [PrivateMessageController],
  // ContentFilterService ne dépend que de ConfigService (global) → on le fournit ici.
  providers: [PrivateMessageService, ContentFilterService],
  exports: [PrivateMessageService],
})
export class PrivateMessageModule {}
