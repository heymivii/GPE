import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class VerifyExpertDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  expertTitle?: string;

  @IsOptional()
  @IsString()
  expertBio?: string;

  @IsOptional()
  @IsInt()
  expertCountryId?: number;
}
