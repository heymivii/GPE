import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class CreateSearchHintDto {
  @IsString()
  @Length(2, 2)
  countryCode: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  officialDomains?: string[];

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsString()
  queryLang?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeTerms?: string[];

  @IsOptional()
  @IsString()
  pinnedUrl?: string | null;
}
