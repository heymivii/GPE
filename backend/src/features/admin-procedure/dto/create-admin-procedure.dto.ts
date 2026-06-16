import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateAdminProcedureDto {
  @IsNotEmpty()
  @IsString()
  procedureType: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  stepOrder?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageDelayDays?: number;

  @IsNotEmpty()
  @IsNumber()
  countryId: number;
}
