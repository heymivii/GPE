import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpertApplicationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  expertTitle: string;

  /** Assez long pour être évaluable, borné pour éviter les pavés injectés. */
  @IsString()
  @MinLength(50)
  @MaxLength(4000)
  motivation: string;

  /** Envoyé en multipart : la valeur arrive en chaîne, d'où le Type(() => Number). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  countryId?: number;
}
