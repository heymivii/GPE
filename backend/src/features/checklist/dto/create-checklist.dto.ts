import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class CreateChecklistDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsObject()
  steps: object;

  @IsNotEmpty()
  @IsNumber()
  countryId: number;
}
