import { Module } from '@nestjs/common';
import { PropertyInvestmentController } from './property-investment.controller';
import { PropertyInvestmentService } from './property-investment.service';

@Module({
  controllers: [PropertyInvestmentController],
  providers: [PropertyInvestmentService],
})
export class PropertyInvestmentModule {}
