import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateAdminProcedureDto {
  @IsNotEmpty()
  @IsString()
  processType: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requiredDocuments?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageDuration?: number;

  @IsNotEmpty()
  @IsNumber()
  idCountry: number;
}
