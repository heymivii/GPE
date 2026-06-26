import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyInvestmentController } from './property-investment.controller';
import { PropertyInvestmentService } from './property-investment.service';
import { PropertyInvestmentCityCache } from './entities/property-investment-city-cache.entity';
import { City } from '../city/entities/city.entity';
import { AdminLogModule } from '../admin-log/admin-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyInvestmentCityCache, City]),
    AdminLogModule,
  ],
  controllers: [PropertyInvestmentController],
  providers: [PropertyInvestmentService],
  exports: [PropertyInvestmentService],
})
export class PropertyInvestmentModule {}
