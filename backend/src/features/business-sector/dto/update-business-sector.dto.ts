import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessSectorDto } from './create-business-sector.dto';

export class UpdateBusinessSectorDto extends PartialType(
  CreateBusinessSectorDto,
) {}
