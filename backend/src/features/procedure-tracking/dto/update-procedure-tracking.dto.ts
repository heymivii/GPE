import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { CreateProcedureTrackingDto } from './create-procedure-tracking.dto';

export class UpdateProcedureTrackingDto extends PartialType(
  CreateProcedureTrackingDto,
) {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  completedFacts?: number[];
}
