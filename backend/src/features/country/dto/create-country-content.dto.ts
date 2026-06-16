import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateCountryContentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  @IsString()
  contentType: string;

  @IsNotEmpty()
  @IsNumber()
  countryId: number;
}
