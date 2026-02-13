import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobOfferDto {
  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  averageSalary?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @IsNotEmpty()
  @IsNumber()
  idCity: number;

  @IsOptional()
  @IsNumber()
  idSector?: number;
}
