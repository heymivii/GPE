import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum UserReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  IMPERSONATION = 'impersonation',
  INAPPROPRIATE = 'inappropriate',
  OTHER = 'other',
}

export class CreateUserReportDto {
  // NB: le rapporteur vient du token, pas du body.
  @IsNotEmpty()
  @IsInt()
  reportedUserId: number;

  @IsNotEmpty()
  @IsEnum(UserReportReason)
  reason: UserReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}
