import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';
import { Checklist } from './entities/checklist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Checklist])],
  controllers: [ChecklistController],
  providers: [ChecklistService],
  exports: [ChecklistService],
})
export class ChecklistModule {}

