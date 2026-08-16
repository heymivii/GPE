import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { ProcedureTrackingController } from './procedure-tracking.controller';
import { DeadlineReminderService } from './deadline-reminder.service';
import { ProcedureTracking } from './entities/procedure-tracking.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcedureTracking,
      ExpatriationProject,
      AdminProcedure,
    ]),
    NotificationModule,
  ],
  controllers: [ProcedureTrackingController],
  providers: [ProcedureTrackingService, DeadlineReminderService],
  exports: [ProcedureTrackingService],
})
export class ProcedureTrackingModule {}
