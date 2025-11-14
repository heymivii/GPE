import { PartialType } from '@nestjs/mapped-types';
import { CreateCostOfLivingDto } from './create-cost-of-living.dto';

export class UpdateCostOfLivingDto extends PartialType(CreateCostOfLivingDto) {}
