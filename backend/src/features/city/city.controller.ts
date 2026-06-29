import {
  BadRequestException,
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
    const city = await this.cityService.create(createCityDto, req.user.userId);
    await this.adminLogService.log(
      req.user.userId,
      'CREATE',
      'City',
      city.idCity.toString(),
      `Création de la ville "${city.name}" (en attente de vérification)`,
    );
    return city;
  }

  /** Step 1 (assigned reviewer): mark the verification as done → creator gets notified. */
  @Patch(':id/review-done')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reviewDone(@Param('id') id: string, @Request() req) {
    const city = await this.cityService.markReviewDone(+id, req.user.userId);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'City',
      id,
      `Vérification effectuée : ville "${city.name}" — en attente de validation finale`,
    );
    return city;
  }

  /** Approve a pending city → published user-side. Reviewer must NOT be its author (4 eyes). */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approve(@Param('id') id: string, @Request() req) {
    const city = await this.cityService.reviewCity(+id, req.user.userId, true);
    await this.adminLogService.log(
      req.user.userId,
      'APPROVE',
      'City',
      id,
      `Vérification approuvée : ville "${city.name}" publiée`,
    );
    return city;
  }

  /** Reject a pending city → stays invisible user-side. */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reject(@Param('id') id: string, @Request() req) {
    const city = await this.cityService.reviewCity(+id, req.user.userId, false);
    await this.adminLogService.log(
      req.user.userId,
      'REJECT',
      'City',
      id,
      `Vérification rejetée : ville "${city.name}" non publiée`,
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

  // Geo data auto-fill (lat/long/population/timezone/capital/image) from free keyless
  // sources — called automatically by the admin form when a city is selected.
  // Declared BEFORE ':id' so 'autofill' is not captured as an id param.
  @Get('autofill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAutofill(@Query('name') name = '', @Query('country') country = '') {
    if (!name.trim()) {
      throw new BadRequestException('name is required');
    }
    return this.cityService.autofill(name.trim(), country.trim() || undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cityService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateCityDto: UpdateCityDto,
    @Request() req,
  ) {
    const city = await this.cityService.update(+id, updateCityDto);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'City',
      city.idCity.toString(),
      `Modification de la ville "${city.name}"`,
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
      `Suppression de la ville "${city.name}"`,
    );
  }
}
