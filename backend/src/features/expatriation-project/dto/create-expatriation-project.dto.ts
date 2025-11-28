import { IsNotEmpty, IsOptional, IsNumber, IsString, IsBoolean, IsDateString, IsIn, Min } from 'class-validator';

export class CreateExpatriationProjectDto {
  @IsNotEmpty()
  @IsNumber()
  idDestinationCountry: number;

  @IsOptional()
  @IsNumber()
  idDestinationCity?: number;

  @IsOptional()
  @IsString()
  @IsIn(['alone', 'couple', 'family', 'friends', 'other'])
  travelType?: string;

  @IsOptional()
  @IsString()
  @IsIn(['work', 'study', 'retirement', 'adventure', 'family_reunion', 'other'])
  mainObjective?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expectedDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  housingBudget?: number;

  @IsOptional()
  @IsString()
  priorities?: string;

  @IsOptional()
  @IsString()
  stepsDone?: string;

  @IsOptional()
  @IsBoolean()
  needsSupport?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['planning', 'active', 'completed', 'cancelled', 'on_hold'])
  projectStatus?: string;

  @IsOptional()
  @IsDateString()
  expectedDepartureDate?: string;
}
