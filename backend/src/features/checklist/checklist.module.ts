import { Module } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';

@Module({
  controllers: [ChecklistController],
  providers: [ChecklistService],
})
export class ChecklistModule {}
