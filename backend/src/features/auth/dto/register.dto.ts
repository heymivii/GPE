// 📍 EMPLACEMENT: backend/src/features/auth/dto/register.dto.ts

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

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  fullName: string;

  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
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