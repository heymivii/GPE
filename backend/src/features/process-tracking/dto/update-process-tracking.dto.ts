import { PartialType } from '@nestjs/mapped-types';
import { CreateProcessTrackingDto } from './create-process-tracking.dto';

export class UpdateProcessTrackingDto extends PartialType(
  CreateProcessTrackingDto,
) {}
