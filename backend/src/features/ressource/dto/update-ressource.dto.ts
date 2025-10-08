import { PartialType } from '@nestjs/mapped-types';
import { CreateRessourceDto } from './create-ressource.dto';

export class UpdateRessourceDto extends PartialType(CreateRessourceDto) {}
