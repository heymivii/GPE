import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovLink } from './entities/gov-link.entity';
import {
  GenerationRun,
  GenerationRunResultItem,
  GenerationCategoryResult,
  GenerationRunStatus,
} from './entities/generation-run.entity';
import { GovLinksService, GovLinkResult } from './gov-links.service';
import { CANONICAL_CATEGORIES } from './gov-links.types';
import { AdminProcedureGeneratorService } from '../admin-procedure/admin-procedure-generator.service';

/** A 'running' run older than this (e.g. process restarted mid-run) is reported as 'failed' on read. */
const STALE_RUN_MS = 10 * 60 * 1000;

/**
 * Orchestrates a per-country generation run: for each canonical category it generates the official
 * link (reusing GovLinksService.generate — NOT rewritten), VERIFIES it via composable hooks, decides
 * the final review verdict, and only `verified` links stay gov_link.status='active' (so they alone
 * are picked up by AdminProcedureGeneratorService.generateFromGovLinks → the checklist).
 *
 * Runs in-process, fire-and-forget (no Redis/BullMQ — Render single instance). The `generation_run`
 * DB row is the source of truth the admin UI polls.
 */
@Injectable()
export class GenerationOrchestratorService {
  private readonly logger = new Logger(GenerationOrchestratorService.name);

  constructor(
    @InjectRepository(GenerationRun) private readonly runs: Repository<GenerationRun>,
    @InjectRepository(GovLink) private readonly govLinkRepo: Repository<GovLink>,
    private readonly govLinks: GovLinksService,
    private readonly generator: AdminProcedureGeneratorService,
  ) {}

  /** Create the run row: status 'running', all categories pre-filled with result:null (⏳). */
  async createRun(countryCode: string): Promise<GenerationRun> {
    const cc = countryCode.toUpperCase();
    const results: GenerationRunResultItem[] = CANONICAL_CATEGORIES.map((category) => ({
      category,
      result: null,
      url: null,
      confidence: null,
      message: null,
    }));
    return this.runs.save(
      this.runs.create({
        countryCode: cc,
        status: 'running',
        total: CANONICAL_CATEGORIES.length,
        results,
      }),
    );
  }

  /**
   * Background worker — DO NOT await from the controller. Processes each category sequentially
   * (updating the run row as it goes), then publishes the verified links once, then closes the run.
   */
  async runForCountry(runId: number, countryCode: string): Promise<void> {
    const cc = countryCode.toUpperCase();
    try {
      for (const category of CANONICAL_CATEGORIES) {
        await this.processCategory(runId, cc, category);
      }
      // Auto-publish: generateFromGovLinks reads only status:'active' gov_links → only `verified` ones.
      await this.generator.generateFromGovLinks(cc);
      await this.closeRun(runId, 'done');
    } catch (e) {
      this.logger.error(`Generation run ${runId} (${cc}) failed: ${(e as Error)?.message}`);
      await this.closeRun(runId, 'failed');
    }
  }

  /**
   * Generate + verify ONE (country, category); set gov_link status FROM the verdict so that a
   * re-verified row re-publishes itself (no one-way downgrade). Write the result into the run.
   * Reused by runForCountry AND single-cell re-run.
   */
  async processCategory(
    runId: number,
    countryCode: string,
    category: string,
  ): Promise<GenerationRunResultItem> {
    const cc = countryCode.toUpperCase();
    let item: GenerationRunResultItem;
    try {
      const gen = await this.govLinks.generate(cc, category);
      const verdict = this.verify(cc, category, gen);
      // Status reflects the CURRENT verdict — re-verified links re-publish themselves (no one-way downgrade).
      if (gen.url) {
        const finalStatus = verdict.result === 'verified' ? 'active' : 'needs_review';
        await this.govLinkRepo.update({ countryCode: cc, category }, { status: finalStatus });
      }
      item = {
        category,
        result: verdict.result,
        url: gen.url,
        confidence: gen.url ? gen.confidence ?? 0 : null,
        message: verdict.message,
      };
    } catch (e) {
      item = {
        category,
        result: 'failed',
        url: null,
        confidence: null,
        message: (e as Error)?.message ?? 'Erreur de génération',
      };
    }
    await this.updateResult(runId, item);
    return item;
  }

  /**
   * Re-run a single (country, category) cell within an existing run, then re-sync publication
   * so that the checklist immediately reflects the new verdict.
   */
  async rerunCategory(runId: number, countryCode: string, category: string): Promise<GenerationRun | null> {
    const cc = countryCode.toUpperCase();
    await this.processCategory(runId, cc, category);
    // Re-sync: generateFromGovLinks reads active gov_links → checklist reflects new verdict.
    await this.generator.generateFromGovLinks(cc);
    return this.findById(runId);
  }

  // ── Verification: composition of hooks → { result, message } ────────────────────────
  private verify(
    countryCode: string,
    category: string,
    gen: GovLinkResult,
  ): { result: GenerationCategoryResult; message: string } {
    // GovLinksService already returns url=null (needs_review) when nothing verified → 'failed' for the run.
    if (!gen.url) return { result: 'failed', message: 'Aucun lien officiel vérifié trouvé.' };

    const reasons: string[] = [];
    const relevance = this.relevanceGate(countryCode, category, gen);
    if (!relevance.ok) reasons.push(relevance.reason ?? 'page hors-cible');
    const grounding = this.groundingCheck(gen);
    if (grounding.ratio < 0.5) reasons.push(`ancrage faible (${Math.round(grounding.ratio * 100)}%)`);
    const linter = this.businessLinter(category, gen);
    if (linter.flags.length) reasons.push(...linter.flags);
    if ((gen.confidence ?? 0) < 0.5) reasons.push('confiance faible');
    if (!gen.actions?.length) reasons.push('aucune action extraite');

    if (reasons.length) return { result: 'needs_review', message: reasons.join(' · ') };
    return { result: 'verified', message: 'Vérifié ✓' };
  }

  // ── Verification HOOKS — MINIMAL placeholders. To be filled by their dedicated prompts WITHOUT
  //    touching this orchestrator (keep these signatures stable). ─────────────────────
  /** TODO(prompt: source-relevance): is this the canonical "how-to" page for an INCOMING expat? */
  private relevanceGate(
    _countryCode: string,
    _category: string,
    _gen: GovLinkResult,
  ): { ok: boolean; direction: string | null; audience: string | null; reason: string | null } {
    return { ok: true, direction: null, audience: null, reason: null };
  }

  /** TODO(prompt: span-validation): ratio of facts/actions supported by the source page text.
   *  Minimal: generate() doesn't expose the page text yet → neutral 1.0 (no false downgrades). */
  private groundingCheck(_gen: GovLinkResult): { ratio: number } {
    return { ratio: 1 };
  }

  /** TODO(prompt: business-linter): full domain rules. Minimal: the AME rule. */
  private businessLinter(category: string, gen: GovLinkResult): { flags: string[] } {
    const flags: string[] = [];
    const text = [...(gen.summary ?? []), ...(gen.actions ?? [])].join(' ').toLowerCase();
    if (category === 'sante' && /\bame\b|aide médicale d['’]état/.test(text)) {
      flags.push("mention de l'AME (réservée aux sans-papiers) — un expatrié avec visa relève de la PUMa");
    }
    return { flags };
  }

  // ── Run row helpers ─────────────────────────────────────────────────────────────────
  /** Replace the matching category's item (reload-modify-save; runs are sequential → no race). */
  private async updateResult(runId: number, item: GenerationRunResultItem): Promise<void> {
    const run = await this.runs.findOne({ where: { id: runId } });
    if (!run) return;
    const results = (run.results ?? []).map((r) => (r.category === item.category ? item : r));
    if (!results.some((r) => r.category === item.category)) results.push(item);
    await this.runs.update({ id: runId }, { results });
  }

  private async closeRun(runId: number, status: GenerationRunStatus): Promise<void> {
    await this.runs.update({ id: runId }, { status, finishedAt: new Date() });
  }

  // ── Reads (with stale-run handling) ───────────────────────────────────────────────────
  async findById(id: number): Promise<GenerationRun | null> {
    return this.markStaleIfNeeded(await this.runs.findOne({ where: { id } }));
  }

  async findLatest(countryCode: string): Promise<GenerationRun | null> {
    return this.markStaleIfNeeded(
      await this.runs.findOne({
        where: { countryCode: countryCode.toUpperCase() },
        order: { startedAt: 'DESC' },
      }),
    );
  }

  private async markStaleIfNeeded(run: GenerationRun | null): Promise<GenerationRun | null> {
    if (run && run.status === 'running' && Date.now() - new Date(run.startedAt).getTime() > STALE_RUN_MS) {
      run.status = 'failed';
      run.finishedAt = new Date();
      await this.runs.update({ id: run.id }, { status: 'failed', finishedAt: run.finishedAt });
    }
    return run;
  }
}
