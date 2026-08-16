import { IsInt, IsOptional, IsString } from 'class-validator';

/** Admin force-fetch of a city's Numbeo indices; slug override for non-English city names. */
export class FetchCityIndicesDto {
  @IsInt()
  cityId: number;

  @IsOptional()
  @IsString()
  slug?: string;
}
