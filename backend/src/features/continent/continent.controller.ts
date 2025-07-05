import { Controller, Post, Get, Body } from '@nestjs/common';
import { ContinentService } from './continent.service';

@Controller('continent')
export class ContinentController {
  constructor(private readonly continentService: ContinentService) {}

  @Post()
  create(@Body() body: { name: string; isoCode: string }) {
    return this.continentService.create(body.name, body.isoCode);
  }

  @Get()
  findAll() {
    return this.continentService.findAll();
  }
}
