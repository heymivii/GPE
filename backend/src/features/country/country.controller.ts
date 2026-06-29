import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AdminLogService } from '../admin-log/admin-log.service';

@ApiTags('Country')
@Controller('country')
export class CountryController {
  constructor(
    private readonly countryService: CountryService,
    private readonly adminLogService: AdminLogService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateCountryDto, @Request() req) {
    const country = await this.countryService.create(
      createDto,
      req.user.userId,
    );
    await this.adminLogService.log(
      req.user.userId,
      'CREATE',
      'Country',
      country.idCountry.toString(),
      `Création du pays "${country.countryName}" (publié immédiatement)`,
    );
    return country;
  }

  /** Approve a pending country → published user-side. Reviewer must NOT be its author (4 eyes). */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approve(@Param('id') id: string, @Request() req) {
    const country = await this.countryService.reviewCountry(
      +id,
      req.user.userId,
      true,
    );
    await this.adminLogService.log(
      req.user.userId,
      'APPROVE',
      'Country',
      id,
      `Vérification approuvée : pays "${country.countryName}" publié`,
    );
    return country;
  }

  /** Reject a pending country → stays invisible user-side. */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reject(@Param('id') id: string, @Request() req) {
    const country = await this.countryService.reviewCountry(
      +id,
      req.user.userId,
      false,
    );
    await this.adminLogService.log(
      req.user.userId,
      'REJECT',
      'Country',
      id,
      `Vérification rejetée : pays "${country.countryName}" non publié`,
    );
    return country;
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.countryService.findAll(status);
  }

  // All ~250 countries from restCountries (for the admin country picker).
  // Admin-only: it triggers outbound calls to a third-party geo API.
  @Get('available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAvailable() {
    return this.countryService.getAvailableCountries();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countryService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCountryDto,
    @Request() req,
  ) {
    const country = await this.countryService.update(+id, updateDto);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'Country',
      country.idCountry.toString(),
      `Modification du pays "${country.countryName}"`,
    );
    return country;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const country = await this.countryService.findOne(+id);
    await this.countryService.remove(+id);
    await this.adminLogService.log(
      req.user.userId,
      'DELETE',
      'Country',
      id,
      `Suppression du pays "${country.countryName}"`,
    );
  }
}
