import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminFetchCostOfLivingDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  // English country name accepted by the cost-of-living allow-list (France / United
  // States / Japan / Switzerland), or an alias the service normalises (fr, usa, ...).
  @IsString()
  @IsNotEmpty()
  country: string;

  // Optional Numbeo slug override; defaults to the city name with spaces -> hyphens.
  @IsString()
  @IsOptional()
  slug?: string;
}
