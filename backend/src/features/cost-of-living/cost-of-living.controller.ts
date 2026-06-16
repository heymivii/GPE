import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CostOfLivingService } from './cost-of-living.service';
import { AdminFetchCostOfLivingDto } from './dto/admin-fetch-cost-of-living.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Cost of Living')
@Controller('cost-of-living')
export class CostOfLivingController {
  constructor(private readonly costOfLivingService: CostOfLivingService) {}

  @Get('search')
  async getCostOfLiving(
    @Query('city') city: string,
    @Query('country') country: string,
  ) {
    return this.costOfLivingService.getCostOfLiving(city, country);
  }

  @Post('seed')
  async seedCache() {
    return this.costOfLivingService.seedAllCities();
  }

  // Admin: fetch & store a city's cost of living from Numbeo (deterministic parser, no AI).
  @Post('admin/fetch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminFetch(@Body() dto: AdminFetchCostOfLivingDto) {
    return this.costOfLivingService.fetchAndStoreCuratedCity(dto);
  }
}
