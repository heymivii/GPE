import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { User } from '../user/entities/user.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { ForumTopic } from '../forum-topic/entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { Country } from '../country/entities/country.entity';
import { City } from '../city/entities/city.entity';
import { TravelType } from '../project/travel-type/travel-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ExpatriationProject,
      ForumTopic,
      ForumMessage,
      Country,
      City,
      TravelType,
    ]),
  ],
  controllers: [AdminStatsController],
  providers: [AdminStatsService],
})
export class AdminStatsModule {}
