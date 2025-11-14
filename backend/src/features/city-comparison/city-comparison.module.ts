import { Module } from '@nestjs/common';
import { CityComparisonService } from './city-comparison.service';
import { CityComparisonController } from './city-comparison.controller';

@Module({
  controllers: [CityComparisonController],
  providers: [CityComparisonService],
})
export class CityComparisonModule {}
