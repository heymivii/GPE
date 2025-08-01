import { Controller, Get } from '@nestjs/common';
import { CityService } from './city.service';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  findAll() {
    return this.cityService.findAll();
  }

  @Get('import')
  importCities() {
    return this.cityService.importCitiesFromGeoDb();
  }
}
