import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsNumber } from 'class-validator';
import { CreateProcedureTrackingDto } from './create-procedure-tracking.dto';

export class UpdateProcedureTrackingDto extends PartialType(
  CreateProcedureTrackingDto,
) {
  // Index des sous-étapes cochées : le front envoie des nombres, la colonne est jsonb.
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  completedFacts?: number[];
}
