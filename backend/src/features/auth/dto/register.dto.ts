import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsPersonName } from '../../../common/validation/person-name';

export class RegisterDto {
  @IsPersonName('Le prénom')
  firstName: string;

  @IsPersonName('Le nom')
  lastName: string;

  // Normalisé à l'inscription : « Tene@Mail.COM » et « tene@mail.com » ne doivent
  // pas pouvoir créer deux comptes distincts (la contrainte unique est sensible
  // à la casse). La connexion compare ensuite en minuscules des deux côtés.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(255, { message: "L'email ne doit pas dépasser 255 caractères" })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsEnum([
    'student',
    'employee',
    'self_employed',
    'retired',
    'unemployed',
    'other',
  ])
  status?: string;

  @IsOptional()
  @IsEnum(['none', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'])
  languageLevel?: string;

  @IsOptional()
  @IsInt()
  countryOriginId?: number;
}
