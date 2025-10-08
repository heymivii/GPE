import { PartialType } from '@nestjs/mapped-types';
import { CreatePayDto } from './create-pay.dto';

export class UpdatePayDto extends PartialType(CreatePayDto) {}
