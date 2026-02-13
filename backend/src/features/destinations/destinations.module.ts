import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';
import { ForumTopic } from '../forum-topic/entities/forum-topic.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { JobOffer } from '../job-offer/entities/job-offer.entity';
import { Resource } from '../resource/entities/resource.entity';
import { CostOfLivingModule } from '../cost-of-living/cost-of-living.module';
import { JobOfferModule } from '../job-offer/job-offer.module';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      City,
      Country,
      AdminProcedure,
      ForumTopic,
      ExpatriationProject,
      JobOffer,
      Resource,
    ]),
    CostOfLivingModule,
    JobOfferModule,
  ],
  controllers: [DestinationsController],
  providers: [DestinationsService],
  exports: [DestinationsService],
})
export class DestinationsModule {}
