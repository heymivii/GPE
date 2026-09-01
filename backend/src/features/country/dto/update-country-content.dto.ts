import { PartialType } from '@nestjs/swagger';
import { CreateCountryContentDto } from './create-country-content.dto';

export class UpdateCountryContentDto extends PartialType(
  CreateCountryContentDto,
) {}
