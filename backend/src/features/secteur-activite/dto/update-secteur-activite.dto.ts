import { PartialType } from '@nestjs/mapped-types';
import { CreateSecteurActiviteDto } from './create-secteur-activite.dto';

export class UpdateSecteurActiviteDto extends PartialType(CreateSecteurActiviteDto) {}
