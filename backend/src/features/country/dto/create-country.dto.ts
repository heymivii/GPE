import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
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
  @IsIn(['active', 'archived'])
  status?: 'active' | 'archived';

  @IsNotEmpty()
  @IsNumber()
  continentId: number;
}
