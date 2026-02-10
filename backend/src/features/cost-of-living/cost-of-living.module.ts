import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostOfLivingService } from './cost-of-living.service';
import { CostOfLivingController } from './cost-of-living.controller';
import { CostOfLivingCleanerService } from './cost-of-living-cleaner.service';
import { CostOfLivingCache } from './entities/cost-of-living-cache.entity';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CostOfLivingCache, City, Country])],
  controllers: [CostOfLivingController],
  providers: [CostOfLivingService, CostOfLivingCleanerService],
  exports: [CostOfLivingService],
})
export class CostOfLivingModule {}
