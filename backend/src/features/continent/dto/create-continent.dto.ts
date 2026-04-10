import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateContinentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  isoCode?: string;
}
