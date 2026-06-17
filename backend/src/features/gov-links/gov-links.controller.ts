import { BadRequestException, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GovLinksService } from './gov-links.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CANONICAL_CATEGORIES, SUPPORTED_COUNTRIES } from './gov-links.types';

@ApiTags('Gov Links')
@Controller('gov-links')
export class GovLinksController {
  constructor(private readonly service: GovLinksService) {}

  @Get('health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  health() {
    return this.service.checkHealth();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(
    @Query('country') country?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({ countryCode: country, category, status });
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  generate(@Query('country') country: string, @Query('category') category: string) {
    const cc = (country ?? '').toUpperCase();
    if (!(SUPPORTED_COUNTRIES as readonly string[]).includes(cc)) {
      throw new BadRequestException(`Unsupported country: ${country ?? ''}`);
    }
    if (!(CANONICAL_CATEGORIES as readonly string[]).includes(category)) {
      throw new BadRequestException(`Unknown category: ${category ?? ''}`);
    }
    return this.service.generate(cc, category);
  }
}
