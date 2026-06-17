import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QualityOfLifeService } from './quality-of-life.service';

@ApiTags('Quality of Life')
@Controller('quality-of-life')
export class QualityOfLifeController {
  constructor(private readonly service: QualityOfLifeService) {}

  // Public: country-level Quality of Life indices from Numbeo (DB-cached 30 days).
  @Get()
  async get(@Query('country') country: string) {
    return this.service.getByCountry(country);
  }
}
