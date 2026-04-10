import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCityComparisonDto {
  @IsNotEmpty()
  @IsNumber()
  cityId: number;
}
