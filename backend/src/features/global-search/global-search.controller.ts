import {
  Controller,
  Get,
  Query,
  Post,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GlobalSearchService } from './global-search.service';
import { GlobalSearchDto } from './dto/global-search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Global Search')
@Controller('global-search')
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  search(@Query() dto: GlobalSearchDto) {
    return this.globalSearchService.search(dto);
  }

  // Full-table reindex — admin only, sinon n'importe qui peut marteler la BDD.
  @Post('refresh')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  refresh() {
    return this.globalSearchService.refreshIndex();
  }
}
