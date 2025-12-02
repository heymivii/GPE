import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateChecklistProgressDto {
  @IsString()
  stepId: string;

  @IsBoolean()
  completed: boolean;

  @IsOptional()
  @IsString()
  substepId?: string;
}
