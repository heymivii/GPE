import { Module } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';
import { AdzunaService } from './adzuna.service';

@Module({
  controllers: [JobOfferController],
  providers: [JobOfferService, AdzunaService],
  exports: [JobOfferService, AdzunaService],
})
export class JobOfferModule {}
