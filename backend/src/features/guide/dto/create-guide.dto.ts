import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';

enum GuideType {
  HOUSING = 'housing',
  EMPLOYMENT = 'employment',
  HEALTH = 'health',
  EDUCATION = 'education',
  LEGAL = 'legal',
  CULTURE = 'culture',
  TRANSPORTATION = 'transportation',
  OTHER = 'other',
}

export class CreateGuideDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(GuideType)
  guideType?: GuideType;

  @IsNotEmpty()
  @IsNumber()
  idCountry: number;

  @IsOptional()
  @IsNumber()
  authorId?: number;
}
