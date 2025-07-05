import { Controller, Post, Body, Get } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  create(@Body() data: Partial<Country>): Promise<Country> {
    return this.countryService.create(data);
  }

  @Post('import')
  async importFromApiRestCountries() {
    await this.countryService.importFromApiRestCountries();
    return { message: 'Countries imported successfully!' };
  }

  @Get()
  findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }
}
