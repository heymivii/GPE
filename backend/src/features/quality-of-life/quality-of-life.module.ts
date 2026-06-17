import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityOfLifeController } from './quality-of-life.controller';
import { QualityOfLifeService } from './quality-of-life.service';
import { QualityOfLifeCache } from './entities/quality-of-life-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QualityOfLifeCache])],
  controllers: [QualityOfLifeController],
  providers: [QualityOfLifeService],
})
export class QualityOfLifeModule {}
