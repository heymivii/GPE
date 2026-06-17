import { Body, Controller, Get, Post, Put, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CostOfLivingService } from './cost-of-living.service';
import { AdminFetchCostOfLivingDto } from './dto/admin-fetch-cost-of-living.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminLogService } from '../admin-log/admin-log.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../city/entities/city.entity';

@ApiTags('Cost of Living')
@Controller('cost-of-living')
export class CostOfLivingController {
  constructor(
    private readonly costOfLivingService: CostOfLivingService,
    private readonly adminLogService: AdminLogService,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  @Get('search')
  async getCostOfLiving(
    @Query('city') city: string,
    @Query('country') country: string,
  ) {
    return this.costOfLivingService.getCostOfLiving(city, country);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async seedCache() {
    return this.costOfLivingService.seedAllCities();
  }

  @Put(':cityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateCostOfLiving(
    @Param('cityId') cityId: string,
    @Body() data: any,
    @Request() req,
  ) {
    const city = await this.cityRepository.findOne({ where: { idCity: Number(cityId) } });
    const cityName = city ? city.name : `ID ${cityId}`;
    const result = await this.costOfLivingService.updateCostOfLiving(Number(cityId), data);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'CostOfLiving',
      cityId,
      `Mise à jour des données du coût de la vie pour la ville "${cityName}"`
    );
    return result;
  }

  // Admin: fetch & store a city's cost of living from Numbeo (deterministic parser, no AI).
  @Post('admin/fetch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminFetch(@Body() dto: AdminFetchCostOfLivingDto) {
    return this.costOfLivingService.fetchAndStoreCuratedCity(dto);
  }
}
