import { ConflictException, Injectable, Logger } from '@nestjs/common';
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
import { checkSourceRelevance } from './quality/source-relevance';
import { groundingRatio, ungroundedItems } from './quality/grounding';
import { lintExtraction } from './quality/business-linter';
import { officialSuffixes } from './official-domains';

/**
 * A 'running' run whose HEARTBEAT (last completed category — falls back to startedAt) is older
 * than this is reported as 'failed' on read (e.g. process restarted mid-run). Per-category, not
 * per-run: a healthy 11-category run legitimately exceeds any total-duration budget.
 */
const STALE_RUN_MS = 10 * 60 * 1000;

/** Pause between categories so a run doesn't trip SearXNG/Google or the LLM rate-limit (which would
 *  wrongly downgrade good links). Configurable via GENERATION_DELAY_MS. */
const INTER_CATEGORY_DELAY_MS = Number(process.env.GENERATION_DELAY_MS ?? 8000);

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
    @InjectRepository(GenerationRun)
    private readonly runs: Repository<GenerationRun>,
    @InjectRepository(GovLink)
    private readonly govLinkRepo: Repository<GovLink>,
    private readonly govLinks: GovLinksService,
    private readonly generator: AdminProcedureGeneratorService,
  ) {}

  /**
   * Create the run row: status 'running', all categories pre-filled with result:null (⏳).
   * Refuses to start when a run is ALREADY running for this country (double-click guard) —
   * findLatest applies stale detection first, so a dead run never blocks forever.
   */
  async createRun(countryCode: string): Promise<GenerationRun> {
    const cc = countryCode.toUpperCase();
    const latest = await this.findLatest(cc);
    if (latest?.status === 'running') {
      throw new ConflictException(
        `Une génération est déjà en cours pour ${cc} (run #${latest.id}) — attendez la fin.`,
      );
    }
    const results: GenerationRunResultItem[] = CANONICAL_CATEGORIES.map(
      (category) => ({
        category,
        result: null,
        url: null,
        confidence: null,
        message: null,
      }),
    );
    return this.runs.save(
      this.runs.create({
        countryCode: cc,
        status: 'running',
        total: CANONICAL_CATEGORIES.length,
        results,
        lastHeartbeatAt: new Date(),
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
      for (let i = 0; i < CANONICAL_CATEGORIES.length; i++) {
        await this.processCategory(runId, cc, CANONICAL_CATEGORIES[i]);
        // Throttle between categories to avoid rate-limiting (which would falsely downgrade links).
        if (i < CANONICAL_CATEGORIES.length - 1)
          await this.delay(INTER_CATEGORY_DELAY_MS);
      }
      // Auto-publish: generateFromGovLinks reads only status:'active' gov_links → only `verified` ones.
      await this.generator.generateFromGovLinks(cc);
      await this.closeRun(runId, 'done');
    } catch (e) {
      this.logger.error(
        `Generation run ${runId} (${cc}) failed: ${(e as Error)?.message}`,
      );
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
      if (gen.url && verdict.result !== 'verified') {
        // Only a NON-verified verdict forces a downgrade. For a verified verdict we leave the
        // status that generate()/persist() already set: 'pending_review' for a new machine link
        // (HUMAN GATE — an admin must approve it), or 'active' preserved for an unchanged link
        // a human had already approved (no un-publishing on re-run).
        await this.govLinkRepo.update(
          { countryCode: cc, category },
          { status: 'needs_review' },
        );
      }
      item = {
        category,
        result: verdict.result,
        url: gen.url,
        confidence: gen.url ? (gen.confidence ?? 0) : null,
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
   * Refused while the run is still 'running': the background loop and the rerun would both
   * rewrite the same results column and one of them would silently lose its result.
   */
  async rerunCategory(
    runId: number,
    countryCode: string,
    category: string,
  ): Promise<GenerationRun | null> {
    const cc = countryCode.toUpperCase();
    const run = await this.findById(runId);
    if (run?.status === 'running') {
      throw new ConflictException(
        `Le run #${runId} est encore en cours — attendez la fin avant de relancer une catégorie.`,
      );
    }
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
    if (!gen.url)
      return {
        result: 'failed',
        message: 'Aucun lien officiel vérifié trouvé.',
      };

    const reasons: string[] = [];
    const relevance = this.relevanceGate(countryCode, category, gen);
    if (!relevance.ok) reasons.push(relevance.reason ?? 'page hors-cible');
    const grounding = this.groundingCheck(gen);
    if (grounding.ratio < 0.5)
      reasons.push(`ancrage faible (${Math.round(grounding.ratio * 100)}%)`);
    const linter = this.businessLinter(category, gen);
    if (linter.flags.length) reasons.push(...linter.flags);
    if ((gen.confidence ?? 0) < 0.5) reasons.push('confiance faible');
    if (!gen.actions?.length) reasons.push('aucune action extraite');

    if (reasons.length)
      return { result: 'needs_review', message: reasons.join(' · ') };
    return {
      result: 'verified',
      message: 'Vérifié machine ✓ — en attente de validation humaine',
    };
  }

  // ── Verification HOOKS — implemented by the deterministic ./quality modules (no LLM,
  //    no network, fully unit-tested). Signatures kept stable, as promised above. ──────
  /**
   * La page est-elle la bonne source pour un expatrié qui ARRIVE ?
   * Trois axes (quality/source-relevance) : portée NATIONALE (pas de page préfectorale/
   * cantonale — le cas réel « pref14/Calvados »), SENS (pas une page « Français de
   * l'étranger »), PUBLIC (pas un portail entreprises hors catégorie business).
   * S'y ajoute le verdict hors-sujet rendu par le modèle lui-même (prompt, règle 3).
   */
  private relevanceGate(
    countryCode: string,
    category: string,
    gen: GovLinkResult,
  ): {
    ok: boolean;
    direction: string | null;
    audience: string | null;
    reason: string | null;
  } {
    const verdict = checkSourceRelevance(
      {
        countryCode,
        category,
        url: gen.url,
        label: gen.label,
        facts: gen.summary ?? [],
        actions: gen.actions ?? [],
        pageText: gen.pageText ?? null,
      },
      officialSuffixes(countryCode),
      // pinnedUrl : l'admin vouche la SOURCE — les contrôles d'URL s'inclinent,
      // les contrôles de CONTENU (email local, sens de lecture) restent actifs.
      { trustedSource: !!gen.pinned },
    );
    if (gen.offTopic) {
      return {
        ok: false,
        direction: verdict.direction,
        audience: verdict.audience,
        reason: [verdict.reason, 'page jugée hors-sujet par le modèle']
          .filter(Boolean)
          .join(' · '),
      };
    }
    return verdict;
  }

  /**
   * Ancrage (quality/grounding) : part des faits/actions réellement présents dans le
   * texte de la page source. Sans texte de page, le ratio est neutre (1) — un garde-fou
   * muet ne dégrade jamais un lien correct.
   */
  private groundingCheck(gen: GovLinkResult): { ratio: number } {
    const items = [...(gen.summary ?? []), ...(gen.actions ?? [])];
    const ratio = groundingRatio(items, gen.pageText ?? null);
    if (ratio < 1) {
      const loose = ungroundedItems(items, gen.pageText ?? null);
      this.logger.warn(
        `Éléments non ancrés dans la source (${gen.countryCode}/${gen.category}) : ${loose
          .slice(0, 3)
          .join(' | ')}`,
      );
    }
    return { ratio };
  }

  /**
   * Linter métier (quality/business-linter) : hors-sujet lexical, actions vides de
   * contenu, libellés de menu pris pour des tâches, dispositifs inadaptés (AME).
   * Chaque famille correspond à une erreur réellement observée en base.
   */
  private businessLinter(
    category: string,
    gen: GovLinkResult,
  ): { flags: string[] } {
    return lintExtraction({
      category,
      facts: gen.summary ?? [],
      actions: gen.actions ?? [],
    });
  }

  // ── Run row helpers ─────────────────────────────────────────────────────────────────
  /**
   * Replace the matching category's item ATOMICALLY (single SQL statement, no read-modify-write
   * window) and bump the heartbeat. Every run row is pre-filled with all categories at creation,
   * so a replace-in-place is always sufficient.
   */
  private async updateResult(
    runId: number,
    item: GenerationRunResultItem,
  ): Promise<void> {
    await this.runs.query(
      `UPDATE "generation_run"
         SET "results" = (
           SELECT COALESCE(
             jsonb_agg(CASE WHEN elem->>'category' = $2 THEN $3::jsonb ELSE elem END),
             '[]'::jsonb
           )
           FROM jsonb_array_elements("results") AS elem
         ),
         "last_heartbeat_at" = now()
       WHERE "id_generation_run" = $1`,
      [runId, item.category, JSON.stringify(item)],
    );
  }

  private async closeRun(
    runId: number,
    status: GenerationRunStatus,
  ): Promise<void> {
    await this.runs.update({ id: runId }, { status, finishedAt: new Date() });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  private async markStaleIfNeeded(
    run: GenerationRun | null,
  ): Promise<GenerationRun | null> {
    // Staleness = no category completed for STALE_RUN_MS (heartbeat), NOT total run duration.
    const lastAlive = run?.lastHeartbeatAt ?? run?.startedAt;
    if (
      run &&
      run.status === 'running' &&
      lastAlive &&
      Date.now() - new Date(lastAlive).getTime() > STALE_RUN_MS
    ) {
      run.status = 'failed';
      run.finishedAt = new Date();
      await this.runs.update(
        { id: run.id },
        { status: 'failed', finishedAt: run.finishedAt },
      );
    }
    return run;
  }
}
