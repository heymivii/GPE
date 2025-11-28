import { IsEnum, IsOptional, IsInt, IsString, IsDateString } from 'class-validator';

export class CreateProcessTrackingDto {
  @IsInt()
  id_user: number;

  @IsInt()
  id_process: number;

  @IsInt()
  id_project: number;

  @IsEnum(['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'])
  @IsOptional()
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  comments?: string;
}
