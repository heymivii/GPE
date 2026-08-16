import { PartialType } from '@nestjs/mapped-types';
import { CreateForbiddenWordDto } from './create-forbidden-word.dto';

export class UpdateForbiddenWordDto extends PartialType(
  CreateForbiddenWordDto,
) {}
