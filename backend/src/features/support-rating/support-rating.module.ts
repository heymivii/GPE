import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportRating } from './entities/support-rating.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { SupportRatingService } from './support-rating.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportRating, ForumMessage])],
  providers: [SupportRatingService],
  exports: [SupportRatingService],
})
export class SupportRatingModule {}
