import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessTrackingService } from './process-tracking.service';
import { ProcessTrackingController } from './process-tracking.controller';
import { ProcessTracking } from './entities/process-tracking.entity';
import { AdministrativeProcess } from '../administrative-process/entities/administrative-process.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcessTracking,
      AdministrativeProcess,
      ExpatriationProject,
      User,
    ]),
  ],
  controllers: [ProcessTrackingController],
  providers: [ProcessTrackingService],
  exports: [ProcessTrackingService],
})
export class ProcessTrackingModule {}
