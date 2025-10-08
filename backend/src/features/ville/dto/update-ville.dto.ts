import { PartialType } from '@nestjs/mapped-types';
import { CreateVilleDto } from './create-ville.dto';

export class UpdateVilleDto extends PartialType(CreateVilleDto) {}
