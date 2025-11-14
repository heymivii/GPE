import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBusinessSectorDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  sectorName: string;

  @IsOptional()
  @IsString()
  description?: string;
}
