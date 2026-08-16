import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Un expert modifie SON titre / SA bio. Ne peut jamais toucher à la vérification. */
export class UpdateExpertProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  expertTitle?: string;

  @IsOptional()
  @IsString()
  expertBio?: string;
}
