import { Module } from '@nestjs/common';
import { CostOfLivingService } from './cost-of-living.service';
import { CostOfLivingController } from './cost-of-living.controller';

@Module({
  controllers: [CostOfLivingController],
  providers: [CostOfLivingService],
})
export class CostOfLivingModule {}
