import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchJobDto {
  @IsOptional()
  @IsString()
  country?: string; // Code pays ISO (ex: "fr", "gb", "us")

  @IsOptional()
  @IsString()
  city?: string; // Nom de la ville (ex: "Paris", "London")

  @IsOptional()
  @IsString()
  keyword?: string; // Mot-clé de recherche (ex: "developer", "marketing")

  @IsOptional()
  @IsString()
  category?: string; // Catégorie d'emploi (ex: "it-jobs", "engineering-jobs")

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  remote?: boolean; // Filtre pour le télétravail

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1; // Numéro de page

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  resultsPerPage?: number = 20; // Résultats par page (max 50)

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number; // Salaire minimum

  @IsOptional()
  @IsString()
  sortBy?: 'relevance' | 'date' | 'salary' = 'relevance'; // Tri des résultats

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
