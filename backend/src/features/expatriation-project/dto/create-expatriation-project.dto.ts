import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsIn,
  Min,
} from 'class-validator';

export class CreateExpatriationProjectDto {
  @IsNotEmpty()
  @IsNumber()
  destinationCountryId: number;

  @IsOptional()
  @IsNumber()
  destinationCityId?: number;

  @IsOptional()
  @IsNumber()
  travelTypeId?: number;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expectedDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsString()
  @IsIn(['planning', 'active', 'completed', 'cancelled', 'on_hold'])
  status?: string;

  @IsOptional()
  @IsDateString()
  expectedDepartureDate?: string;
}
