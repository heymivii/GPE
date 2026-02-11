import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchJobDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  remote?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  resultsPerPage?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'relevance' | 'date' | 'salary' = 'relevance';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMax?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  full_time?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  part_time?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  contract?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  permanent?: boolean;

  @IsOptional()
  @IsString()
  what_exclude?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_days_old?: number;
}
