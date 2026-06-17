import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PropertyInvestmentService } from './property-investment.service';

@ApiTags('Property Investment')
@Controller('property-investment')
export class PropertyInvestmentController {
  constructor(private readonly service: PropertyInvestmentService) {}

  // Public: country-level property / investment indicators from Numbeo (cached).
  @Get()
  async get(@Query('country') country: string) {
    return this.service.getByCountry(country);
  }
}
