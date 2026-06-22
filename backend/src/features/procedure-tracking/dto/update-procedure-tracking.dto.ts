import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreateProcedureTrackingDto } from './create-procedure-tracking.dto';

export class UpdateProcedureTrackingDto extends PartialType(
  CreateProcedureTrackingDto,
) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedFacts?: string[];
}
