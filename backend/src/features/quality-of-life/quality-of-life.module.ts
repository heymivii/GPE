import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityOfLifeController } from './quality-of-life.controller';
import { QualityOfLifeService } from './quality-of-life.service';
import { QualityOfLifeCache } from './entities/quality-of-life-cache.entity';
import { QualityOfLifeCityCache } from './entities/quality-of-life-city-cache.entity';
import { City } from '../city/entities/city.entity';
import { AdminLogModule } from '../admin-log/admin-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QualityOfLifeCache,
      QualityOfLifeCityCache,
      City,
    ]),
    AdminLogModule,
  ],
  controllers: [QualityOfLifeController],
  providers: [QualityOfLifeService],
  exports: [QualityOfLifeService],
})
export class QualityOfLifeModule {}
