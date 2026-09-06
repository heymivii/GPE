import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GovLinksService } from './gov-links.service';
import { GenerationOrchestratorService } from './generation-orchestrator.service';
import { AdminProcedureGeneratorService } from '../admin-procedure/admin-procedure-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CANONICAL_CATEGORIES } from './gov-links.types';

@ApiTags('Gov Links')
@Controller('gov-links')
export class GovLinksController {
  constructor(
    private readonly service: GovLinksService,
    private readonly orchestrator: GenerationOrchestratorService,
    private readonly procedureGenerator: AdminProcedureGeneratorService,
  ) {}

  @Get('health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  health() {
    return this.service.checkHealth();
  }

  /** The countries this engine can process — the admin UI derives its buttons from HERE. */
  @Get('supported-countries')
  @UseGuards(JwtAuthGuard)
  supportedCountries() {
    return this.service.listSupportedCountries();
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

  /** HUMAN approval: publish a machine-verified link → checklist re-syncs immediately. */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveLink(@Param('id') id: string) {
    const link = await this.service.reviewLink(+id, true);
    // Publication sync: the checklist only reads 'active' links.
    await this.procedureGenerator.generateFromGovLinks(link.countryCode);
    return link;
  }

  /** HUMAN rejection: terminal (dead) — a rejected link is never re-proposed as is; regenerate or pin a URL. */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectLink(@Param('id') id: string) {
    return this.service.reviewLink(+id, false);
  }

  /** Fail FAST with a clear message when the search engine is down — a run without search
   *  would only produce 11 empty "needs_review" cells with no explanation. */
  private async assertSearchUp(): Promise<void> {
    const h = await this.service.checkHealth();
    if (!h.search.ok) {
      throw new ServiceUnavailableException(
        `Moteur de recherche (${h.search.provider}) injoignable — démarrez SearXNG puis réessayez.`,
      );
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async generate(
    @Query('country') country: string,
    @Query('category') category: string,
  ) {
    const cc = (country ?? '').toUpperCase();
    if (!(await this.service.isSupported(cc))) {
      throw new BadRequestException(`Unsupported country: ${country ?? ''}`);
    }
    if (!(CANONICAL_CATEGORIES as readonly string[]).includes(category)) {
      throw new BadRequestException(`Unknown category: ${category ?? ''}`);
    }
    await this.assertSearchUp();
    return this.service.generate(cc, category);
  }

  /**
   * Start a full per-country generation run (fire-and-forget).
   * Returns {runId} immediately; poll GET /gov-links/runs/:id for progress.
   */
  @Post('generate-country')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async generateCountry(@Query('country') country: string) {
    const cc = (country ?? '').toUpperCase();
    if (!(await this.service.isSupported(cc))) {
      throw new BadRequestException(`Unsupported country: ${country ?? ''}`);
    }
    await this.assertSearchUp();
    const run = await this.orchestrator.createRun(cc);
    // Fire-and-forget — do NOT await; caller polls /runs/:id
    void this.orchestrator.runForCountry(run.id, cc);
    return { runId: run.id };
  }

  /**
   * Get the latest generation run for a country.
   * MUST be declared BEFORE runs/:id so 'latest' is not captured as an id param.
   */
  @Get('runs/latest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findLatestRun(@Query('country') country: string) {
    return this.orchestrator.findLatest(country ?? '');
  }

  /** Get a generation run by id. */
  @Get('runs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findRun(@Param('id') id: string) {
    return this.orchestrator.findById(+id);
  }

  /** Re-run a single (country, category) cell within an existing run, then re-sync publication. */
  @Post('runs/:id/rerun')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rerunCategory(
    @Param('id') id: string,
    @Query('category') category: string,
  ) {
    const run = await this.orchestrator.findById(+id);
    if (!run) {
      throw new BadRequestException(`Run not found: ${id}`);
    }
    if (!(CANONICAL_CATEGORIES as readonly string[]).includes(category)) {
      throw new BadRequestException(`Unknown category: ${category ?? ''}`);
    }
    return this.orchestrator.rerunCategory(+id, run.countryCode, category);
  }
}
