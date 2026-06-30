import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCityDto } from './create-city.dto';

/**
 * `assignedToId` is set once at creation and only changed through the review endpoints —
 * never via a generic update (else the assignee/4-eyes guard is bypassable). `status`
 * stays editable (archive/unarchive) but the service blocks status writes while a city
 * is still in a review state.
 */
export class UpdateCityDto extends PartialType(
  OmitType(CreateCityDto, ['assignedToId'] as const),
) {}
