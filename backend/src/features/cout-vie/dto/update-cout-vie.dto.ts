import { PartialType } from '@nestjs/mapped-types';
import { CreateCoutVieDto } from './create-cout-vie.dto';

export class UpdateCoutVieDto extends PartialType(CreateCoutVieDto) {}
