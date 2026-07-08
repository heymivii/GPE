import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const WORD_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type WordSeverity = (typeof WORD_SEVERITIES)[number];

export class CreateForbiddenWordDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  word: string;

  // low/medium → publié mais flaggé + avertissement ; high/critical → bloqué.
  @IsOptional()
  @IsIn(WORD_SEVERITIES)
  severity?: WordSeverity;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
