import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { City } from './entities/city.entity';
import { AdminLogModule } from '../admin-log/admin-log.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [TypeOrmModule.forFeature([City]), AdminLogModule, ReviewModule],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
