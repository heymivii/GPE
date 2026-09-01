import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchHintService } from './search-hint.service';
import { CreateSearchHintDto } from './dto/create-search-hint.dto';
import { UpdateSearchHintDto } from './dto/update-search-hint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminLogService } from '../admin-log/admin-log.service';

@ApiTags('Search Hints')
@Controller('search-hint')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SearchHintController {
  constructor(
    private readonly service: SearchHintService,
    private readonly adminLog: AdminLogService,
  ) {}

  @Get()
  list(@Query('country') country?: string, @Query('category') category?: string) {
    return this.service.list({ countryCode: country, category });
  }

  // Declared before the :cc/:cat routes — `seed` is a literal path, not a param.
  @Post('seed')
  async seed(@Request() req) {
    const res = await this.service.seedMissing();
    await this.adminLog.log(
      req.user.userId,
      'SEED',
      'SearchHint',
      'all',
      `Seed carnet de recherche : ${res.inserted} insérée(s), ${res.skipped} existante(s) conservée(s)`,
    );
    return res;
  }

  @Get(':cc/:cat')
  findOne(@Param('cc') cc: string, @Param('cat') cat: string) {
    return this.service.findOne(cc, cat);
  }

  @Post()
  async create(@Body() dto: CreateSearchHintDto, @Request() req) {
    const hint = await this.service.create(dto);
    await this.adminLog.log(
      req.user.userId,
      'CREATE',
      'SearchHint',
      `${hint.countryCode}/${hint.category}`,
      `Fiche de recherche créée (${hint.countryCode}/${hint.category})`,
    );
    return hint;
  }

  @Patch(':cc/:cat')
  async update(
    @Param('cc') cc: string,
    @Param('cat') cat: string,
    @Body() dto: UpdateSearchHintDto,
    @Request() req,
  ) {
    const hint = await this.service.update(cc, cat, dto);
    await this.adminLog.log(
      req.user.userId,
      'UPDATE',
      'SearchHint',
      `${cc.toUpperCase()}/${cat}`,
      `Fiche de recherche modifiée (${cc.toUpperCase()}/${cat})`,
    );
    return hint;
  }

  @Delete(':cc/:cat')
  async remove(@Param('cc') cc: string, @Param('cat') cat: string, @Request() req) {
    await this.service.remove(cc, cat);
    await this.adminLog.log(
      req.user.userId,
      'DELETE',
      'SearchHint',
      `${cc.toUpperCase()}/${cat}`,
      `Fiche de recherche supprimée (${cc.toUpperCase()}/${cat})`,
    );
    return { deleted: true };
  }
}
