import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCityComparisonDto {
  @IsNotEmpty()
  @IsNumber()
  idUser: number;

  @IsNotEmpty()
  @IsNumber()
  idCity: number;
}
