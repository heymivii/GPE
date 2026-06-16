import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisaRequirement } from './visa-requirement.entity';
import { VisaRequirementService } from './visa-requirement.service';

@Module({
  imports: [TypeOrmModule.forFeature([VisaRequirement])],
  providers: [VisaRequirementService],
  exports: [VisaRequirementService],
})
export class VisaRequirementModule {}
