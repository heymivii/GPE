import { PartialType } from '@nestjs/mapped-types';
import { CreateExpatriationProjectDto } from './create-expatriation-project.dto';

export class UpdateExpatriationProjectDto extends PartialType(CreateExpatriationProjectDto) {}
