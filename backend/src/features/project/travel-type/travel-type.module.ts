import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelType } from './travel-type.entity';
import { TravelTypeService } from './travel-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([TravelType])],
  providers: [TravelTypeService],
  exports: [TravelTypeService],
})
export class TravelTypeModule {}
