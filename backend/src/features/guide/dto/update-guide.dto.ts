import { PartialType } from '@nestjs/mapped-types';
import { CreateGuideDto } from './create-guide.dto';

export class UpdateGuideDto extends PartialType(CreateGuideDto) {}
