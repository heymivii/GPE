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

  @IsNotEmpty()
  @IsNumber()
  continentId: number;
}
