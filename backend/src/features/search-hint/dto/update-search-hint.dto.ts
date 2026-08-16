import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSearchHintDto } from './create-search-hint.dto';

/** Editable fields only — countryCode/category come from the route params and are not updatable. */
export class UpdateSearchHintDto extends PartialType(
  OmitType(CreateSearchHintDto, ['countryCode', 'category'] as const),
) {}
