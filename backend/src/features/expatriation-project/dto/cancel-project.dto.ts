import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CancelProjectDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  details?: string;
}
