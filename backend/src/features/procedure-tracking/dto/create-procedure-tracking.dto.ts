import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  IsDateString,
} from 'class-validator';

export class CreateProcedureTrackingDto {
  @IsNotEmpty()
  @IsNumber()
  adminProcedureId: number;

  @IsNotEmpty()
  @IsNumber()
  expatProjectId: number;

  @IsOptional()
  @IsString()
  @IsIn(['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
