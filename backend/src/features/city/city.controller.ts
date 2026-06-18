import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminLogService } from '../admin-log/admin-log.service';

@ApiTags('City')
@Controller('city')
export class CityController {
  constructor(
    private readonly cityService: CityService,
    private readonly adminLogService: AdminLogService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createCityDto: CreateCityDto, @Request() req) {
    const city = await this.cityService.create(createCityDto);
    await this.adminLogService.log(
      req.user.userId,
      'CREATE',
      'City',
      city.idCity.toString(),
      `Création de la ville "${city.name}" (population : ${city.population || 'non renseignée'})`
    );
    return city;
  }

  @Get()
  findAll(
    @Query('countryId') countryId?: string,
    @Query('status') status?: string,
  ) {
    if (countryId) {
      return this.cityService.findByCountry(+countryId, status);
    }
    return this.cityService.findAll(status);
  }

  // Cities of a country (for the admin city picker): GET /city/available?country=France
  // Admin-only: it triggers outbound calls to a third-party geo API.
  @Get('available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAvailable(@Query('country') country = '') {
    return this.cityService.getAvailableCities(country);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cityService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto, @Request() req) {
    const city = await this.cityService.update(+id, updateCityDto);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'City',
      city.idCity.toString(),
      `Modification de la ville "${city.name}"`
    );
    return city;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string, @Request() req) {
    const city = await this.cityService.findOne(+id);
    await this.cityService.remove(+id);
    await this.adminLogService.log(
      req.user.userId,
      'DELETE',
      'City',
      id,
      `Suppression de la ville "${city.name}"`
    );
  }
}
