import { PartialType } from '@nestjs/mapped-types';
import { CreateOffreEmploiDto } from './create-offre-emploi.dto';

export class UpdateOffreEmploiDto extends PartialType(CreateOffreEmploiDto) {}
