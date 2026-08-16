import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostOfLivingService } from './cost-of-living.service';
import { CostOfLivingController } from './cost-of-living.controller';
import { CostOfLivingCleanerService } from './cost-of-living-cleaner.service';
import { CostOfLivingCache } from './entities/cost-of-living-cache.entity';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { AdminLogModule } from '../admin-log/admin-log.module';
import { QualityOfLifeModule } from '../quality-of-life/quality-of-life.module';
import { PropertyInvestmentModule } from '../property-investment/property-investment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CostOfLivingCache, City, Country]),
    AdminLogModule,
    // Auto-chain: a cost-of-living fetch also refreshes the city's QoL + property indices.
    QualityOfLifeModule,
    PropertyInvestmentModule,
  ],
  controllers: [CostOfLivingController],
  providers: [CostOfLivingService, CostOfLivingCleanerService],
  exports: [CostOfLivingService],
})
export class CostOfLivingModule {}
