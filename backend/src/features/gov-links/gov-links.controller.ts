import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GovLinksService } from './gov-links.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Gov Links')
@Controller('gov-links')
export class GovLinksController {
  constructor(private readonly service: GovLinksService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  generate(@Query('country') country: string, @Query('category') category: string) {
    return this.service.generate(country, category);
  }
}
