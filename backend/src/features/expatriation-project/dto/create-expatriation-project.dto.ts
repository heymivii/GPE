import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsIn,
  IsBoolean,
  Length,
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

  @IsOptional()
  @IsString()
  @Length(2, 2)
  nationality?: string;

  @IsOptional()
  @IsBoolean()
  hasChildren?: boolean;

  @IsOptional()
  @IsBoolean()
  hasJobOffer?: boolean;

  // Priorités (chaîne « cat1, cat2 ») — pilotent la perso de la checklist et les recos.
  @IsOptional()
  @IsString()
  @Length(0, 100)
  priorities?: string;

  // Étapes de préparation déjà faites (« id,id »).
  @IsOptional()
  @IsString()
  @Length(0, 255)
  stepsDone?: string;
}
