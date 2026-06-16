import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVisaRequirementDto {
  @IsNotEmpty()
  @IsNumber()
  originCountryId: number;

  @IsNotEmpty()
  @IsNumber()
  destinationCountryId: number;

  @IsNotEmpty()
  @IsString()
  visaType: string;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
