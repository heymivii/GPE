import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';

enum TopicCategory {
  QUESTION = 'question',
  TESTIMONY = 'testimony',
  ADVICE = 'advice',
  DISCUSSION = 'discussion',
  ANNOUNCEMENT = 'announcement',
  OTHER = 'other',
}

export class CreateForumTopicDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(TopicCategory)
  category?: TopicCategory;

  @IsOptional()
  @IsNumber()
  countryId?: number;
}
