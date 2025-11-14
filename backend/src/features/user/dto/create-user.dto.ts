import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsEnum(['student', 'employee', 'self_employed', 'retired', 'unemployed', 'other'])
  status?: string;

  @IsOptional()
  @IsEnum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'])
  languageLevel?: string;

  @IsOptional()
  @IsInt()
  idOriginCountry?: number;
}
