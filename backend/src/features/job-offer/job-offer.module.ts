import { Module } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';

@Module({
  controllers: [JobOfferController],
  providers: [JobOfferService],
})
export class JobOfferModule {}
