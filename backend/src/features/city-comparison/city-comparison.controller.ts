import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CityComparisonService } from './city-comparison.service';
import { CreateCityComparisonDto } from './dto/create-city-comparison.dto';
import { UpdateCityComparisonDto } from './dto/update-city-comparison.dto';

@Controller('city-comparison')
export class CityComparisonController {
  constructor(private readonly cityComparisonService: CityComparisonService) {}

  @Post()
  create(@Body() createCityComparisonDto: CreateCityComparisonDto) {
    return this.cityComparisonService.create(createCityComparisonDto);
  }

  @Get()
  findAll() {
    return this.cityComparisonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cityComparisonService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCityComparisonDto: UpdateCityComparisonDto) {
    return this.cityComparisonService.update(+id, updateCityComparisonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cityComparisonService.remove(+id);
  }
}
