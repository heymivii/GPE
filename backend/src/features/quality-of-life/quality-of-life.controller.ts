import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QualityOfLifeService } from './quality-of-life.service';
import { FetchCityIndicesDto } from './dto/fetch-city-indices.dto';
import { UpdateCityQolDto } from './dto/update-city-qol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminLogService } from '../admin-log/admin-log.service';

@ApiTags('Quality of Life')
@Controller('quality-of-life')
export class QualityOfLifeController {
  constructor(
    private readonly service: QualityOfLifeService,
    private readonly adminLog: AdminLogService,
  ) {}

  // Public: country-level Quality of Life indices from Numbeo (DB-cached 30 days).
  @Get()
  async get(@Query('country') country: string) {
    return this.service.getByCountry(country);
  }

  // Public: CITY-level indices, cache-only (no outbound fetch on the user path).
  @Get('city/:cityId')
  async getCity(@Param('cityId') cityId: string) {
    return this.service.getCachedCity(+cityId);
  }

  // Admin: manual edit of a city's indices (source flips to 'manuel'; a re-fetch replaces it).
  @Put('city/:cityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateCity(
    @Param('cityId') cityId: string,
    @Body() dto: UpdateCityQolDto,
    @Request() req,
  ) {
    const result = await this.service.updateCity(+cityId, dto);
    await this.adminLog.log(
      req.user.userId,
      'UPDATE',
      'QualityOfLife',
      cityId,
      `Indices qualité de vie édités manuellement pour la ville "${result.city}"`,
    );
    return result;
  }

  // Admin: fetch & cache a city's Numbeo quality-of-life indices (force refresh).
  @Post('admin/fetch-city')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminFetchCity(@Body() dto: FetchCityIndicesDto, @Request() req) {
    const result = await this.service.getByCity(dto.cityId, {
      refresh: true,
      slugOverride: dto.slug,
    });
    await this.adminLog.log(
      req.user.userId,
      'UPDATE',
      'QualityOfLife',
      dto.cityId.toString(),
      `Indices qualité de vie Numbeo récupérés pour la ville "${result.city}"`,
    );
    return result;
  }
}
