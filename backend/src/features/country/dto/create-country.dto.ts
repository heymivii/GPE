import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Length,
} from 'class-validator';

export class CreateCountryDto {
  @IsNotEmpty()
  @IsString()
  countryName: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  isoCode?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  visaInfo?: string;

  @IsOptional()
  @IsString()
  flagUrl?: string;

  @IsNotEmpty()
  @IsNumber()
  idContinent: number;
}
