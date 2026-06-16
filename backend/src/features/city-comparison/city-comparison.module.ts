import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityComparisonService } from './city-comparison.service';
import { CityComparisonController } from './city-comparison.controller';
import { CityComparison } from './entities/city-comparison.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CityComparison])],
  controllers: [CityComparisonController],
  providers: [CityComparisonService],
  exports: [CityComparisonService],
})
export class CityComparisonModule {}

