import { PartialType } from '@nestjs/mapped-types';
import { CreateProcedureTrackingDto } from './create-procedure-tracking.dto';

export class UpdateProcedureTrackingDto extends PartialType(
  CreateProcedureTrackingDto,
) {}
