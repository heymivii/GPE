import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CompleteProjectDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  feedback?: string;
}
