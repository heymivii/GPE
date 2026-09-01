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
import { PropertyInvestmentService } from './property-investment.service';
import { FetchCityIndicesDto } from '../quality-of-life/dto/fetch-city-indices.dto';
import { UpdateCityPropertyDto } from './dto/update-city-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminLogService } from '../admin-log/admin-log.service';

@ApiTags('Property Investment')
@Controller('property-investment')
export class PropertyInvestmentController {
  constructor(
    private readonly service: PropertyInvestmentService,
    private readonly adminLog: AdminLogService,
  ) {}

  // Public: country-level property / investment indicators from Numbeo (cached).
  @Get()
  async get(@Query('country') country: string) {
    return this.service.getByCountry(country);
  }

  // Public: CITY-level indicators, cache-only (no outbound fetch on the user path).
  @Get('city/:cityId')
  async getCity(@Param('cityId') cityId: string) {
    return this.service.getCachedCity(+cityId);
  }

  // Admin: manual edit of a city's indicators (source flips to 'manuel'; a re-fetch replaces it).
  @Put('city/:cityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateCity(
    @Param('cityId') cityId: string,
    @Body() dto: UpdateCityPropertyDto,
    @Request() req,
  ) {
    const result = await this.service.updateCity(+cityId, dto);
    await this.adminLog.log(
      req.user.userId,
      'UPDATE',
      'PropertyInvestment',
      cityId,
      `Indicateurs immobiliers édités manuellement pour la ville "${result.city}"`,
    );
    return result;
  }

  // Admin: fetch & cache a city's Numbeo property indicators (force refresh).
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
      'PropertyInvestment',
      dto.cityId.toString(),
      `Indicateurs immobiliers Numbeo récupérés pour la ville "${result.city}"`,
    );
    return result;
  }
}
