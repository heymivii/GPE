import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ReportReasonEnum {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  INAPPROPRIATE = 'inappropriate',
  MISINFORMATION = 'misinformation',
  OTHER = 'other',
}

export class CreateReportDto {
  @IsNotEmpty()
  @IsNumber()
  reporterId: number;

  @IsOptional()
  @IsNumber()
  messageId?: number;

  @IsOptional()
  @IsNumber()
  topicId?: number;

  @IsNotEmpty()
  @IsEnum(ReportReasonEnum)
  reason: ReportReasonEnum;

  @IsOptional()
  @IsString()
  details?: string;
}
