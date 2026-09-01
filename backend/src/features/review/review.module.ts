import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { ReviewService } from './review.service';

/**
 * Shared content-review workflow ("4 eyes"): imported by every feature whose additions
 * must be verified by another admin before publication (country, city, …).
 */
@Module({
  imports: [TypeOrmModule.forFeature([User]), NotificationModule],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
