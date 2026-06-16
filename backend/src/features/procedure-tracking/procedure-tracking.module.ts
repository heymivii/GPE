import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { ProcedureTrackingController } from './procedure-tracking.controller';
import { ProcedureTracking } from './entities/procedure-tracking.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcedureTracking,
      ExpatriationProject,
      AdminProcedure,
    ]),
  ],
  controllers: [ProcedureTrackingController],
  providers: [ProcedureTrackingService],
  exports: [ProcedureTrackingService],
})
export class ProcedureTrackingModule {}
