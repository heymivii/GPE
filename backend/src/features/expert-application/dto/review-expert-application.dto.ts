import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewExpertApplicationDto {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  /** Motif du refus, renvoyé au candidat. */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNote?: string;
}
