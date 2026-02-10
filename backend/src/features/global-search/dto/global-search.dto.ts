import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GlobalSearchDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'country',
    'city',
    'guide',
    'checklist',
    'resource',
    'forum',
    'procedure',
    'service',
    'faq',
  ])
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
