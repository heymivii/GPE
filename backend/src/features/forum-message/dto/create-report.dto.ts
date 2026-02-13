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
  idReporter: number;

  @IsOptional()
  @IsNumber()
  idMessage?: number;

  @IsOptional()
  @IsNumber()
  idTopic?: number;

  @IsNotEmpty()
  @IsEnum(ReportReasonEnum)
  reason: ReportReasonEnum;

  @IsOptional()
  @IsString()
  details?: string;
}
