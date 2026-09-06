import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsPersonName } from '../../../common/validation/person-name';

export class CreateUserDto {
  @IsPersonName('Le prénom')
  firstName: string;

  @IsPersonName('Le nom')
  lastName: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsInt()
  countryOriginId?: number;

  // ✅ Ajouts pour l'onboarding
  @IsOptional()
  @IsEnum(['student', 'employee', 'self_employed', 'retired', 'unemployed', 'other'])
  status?: string;

  @IsOptional()
  @IsEnum(['none', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'])
  languageLevel?: string;
}