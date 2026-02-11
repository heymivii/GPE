import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CostOfLivingService } from './cost-of-living.service';

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
}
