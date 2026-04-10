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
  name: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  isoCode?: string;

  @IsNotEmpty()
  @IsNumber()
  continentId: number;
}
