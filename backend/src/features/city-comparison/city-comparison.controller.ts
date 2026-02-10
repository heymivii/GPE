import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CityComparisonService } from './city-comparison.service';
import { CreateCityComparisonDto } from './dto/create-city-comparison.dto';
import { UpdateCityComparisonDto } from './dto/update-city-comparison.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('City Comparison')
@Controller('city-comparison')
export class CityComparisonController {
  constructor(private readonly cityComparisonService: CityComparisonService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCityComparisonDto: UpdateCityComparisonDto) {
    return this.cityComparisonService.update(+id, updateCityComparisonDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.cityComparisonService.remove(+id);
  }
}
