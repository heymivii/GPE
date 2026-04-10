import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CityComparisonService } from './city-comparison.service';
import { CreateCityComparisonDto } from './dto/create-city-comparison.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('City Comparison')
@Controller('city-comparison')
@UseGuards(JwtAuthGuard)
export class CityComparisonController {
  constructor(private readonly cityComparisonService: CityComparisonService) {}

  @Post()
  create(
    @Request() req,
    @Body() createCityComparisonDto: CreateCityComparisonDto,
  ) {
    return this.cityComparisonService.create(
      req.user.userId,
      createCityComparisonDto,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.cityComparisonService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cityComparisonService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cityComparisonService.remove(+id);
  }
}
