import { PartialType } from '@nestjs/mapped-types';
import { CreateIndustrySectorDto } from './create-industry-sector.dto';

export class UpdateIndustrySectorDto extends PartialType(CreateIndustrySectorDto) {}
