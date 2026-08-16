import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumModerationService } from './forum-moderation.service';
import { ForumModerationController } from './forum-moderation.controller';
import { ForbiddenWord } from './entities/forbidden-word.entity';
import { UserWarning } from './entities/user-warning.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ForbiddenWord, UserWarning, User])],
  controllers: [ForumModerationController],
  providers: [ForumModerationService],
  // Exporté pour que forum-topic / forum-message branchent la modération à la publication.
  exports: [ForumModerationService],
})
export class ForumModerationModule {}
