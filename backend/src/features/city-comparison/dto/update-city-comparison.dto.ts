import { PartialType } from '@nestjs/mapped-types';
import { CreateCityComparisonDto } from './create-city-comparison.dto';

export class UpdateCityComparisonDto extends PartialType(
  CreateCityComparisonDto,
) {}
