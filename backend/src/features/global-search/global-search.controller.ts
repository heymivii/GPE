import { Controller, Get, Query, Post, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GlobalSearchService } from './global-search.service';
import { GlobalSearchDto } from './dto/global-search.dto';

@ApiTags('Global Search')
@Controller('global-search')
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  search(@Query() dto: GlobalSearchDto) {
    return this.globalSearchService.search(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh() {
    return this.globalSearchService.refreshIndex();
  }
}
