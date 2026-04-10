import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { ProcedureTrackingController } from './procedure-tracking.controller';
import { ProcedureTracking } from './entities/procedure-tracking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcedureTracking])],
  controllers: [ProcedureTrackingController],
  providers: [ProcedureTrackingService],
  exports: [ProcedureTrackingService],
})
export class ProcedureTrackingModule {}
