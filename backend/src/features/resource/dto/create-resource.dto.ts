import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsUrl,
} from 'class-validator';

enum ResourceType {
  ARTICLE = 'article',
  VIDEO = 'video',
  PDF = 'pdf',
  WEBSITE = 'website',
  PODCAST = 'podcast',
  TOOL = 'tool',
  OTHER = 'other',
}

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @IsNotEmpty()
  @IsNumber()
  idCountry: number;
}
