import { Module } from '@nestjs/common';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { ProcedureTrackingController } from './procedure-tracking.controller';

@Module({
  controllers: [ProcedureTrackingController],
  providers: [ProcedureTrackingService],
})
export class ProcedureTrackingModule {}
