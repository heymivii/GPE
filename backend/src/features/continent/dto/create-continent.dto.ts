import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateContinentDto {
  @IsNotEmpty()
  @IsString()
  continentName: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  isoCode?: string;
}
