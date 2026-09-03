import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovLink } from './entities/gov-link.entity';
import { buildQueries } from './query-builder';
import { isOfficialDomain, officialSuffixes, preferHintDomains } from './official-domains';
import { SearchProvider } from './search-provider';
import { LinkVerifier } from './link-verifier';
import { LlmRanker } from './llm-ranker';
import { SearchCandidate, GovLinkStatus } from './gov-links.types';
import { countryDisplayName, SUPPORTED_COUNTRIES } from './supported-countries';
import { Country } from '../country/entities/country.entity';
import { SearchHintService } from '../search-hint/search-hint.service';

export const SEARCH_PROVIDER = 'SEARCH_PROVIDER';
export const LLM_RANKER = 'LLM_RANKER';

export interface GovLinkResult {
  countryCode: string;
  category: string;
  url: string | null;
  label: string | null;
  confidence: number;
  status: GovLinkStatus;
  summary?: string[];
  actions?: string[];
  /** Texte lisible de la page retenue — carburant des garde-fous, jamais persisté. */
  pageText?: string;
  /** Le modèle a jugé la page hors-sujet pour la catégorie (prompt, règle 3). */
  offTopic?: boolean;
  /** URL épinglée par un admin : la SOURCE est vouchée (les contrôles d'URL s'inclinent). */
  pinned?: boolean;
}

@Injectable()
export class GovLinksService {
  private readonly logger = new Logger(GovLinksService.name);
  private static readonly FALLBACK_CONFIDENCE = 0.5;
  // pinnedUrl is an explicit admin override → publish with near-certain confidence.
  private static readonly PINNED_CONFIDENCE = 0.99;
  // Cap on verified candidates fed to the ranker: fan-out across many queries can surface a lot.
  private static readonly MAX_VERIFIED = 12;

  constructor(
    @InjectRepository(GovLink) private readonly repo: Repository<GovLink>,
    @Inject(SEARCH_PROVIDER) private readonly search: SearchProvider,
    private readonly verifier: LinkVerifier,
    @Inject(LLM_RANKER) private readonly ranker: LlmRanker,
    // Optional: the editable address book. Absent/undefined → generic fallback queries (no DB hint).
    private readonly hints?: SearchHintService,
    // Optional: admin-managed country config (gov_link_enabled + official_domains).
    // Absent (unit tests) → static registry fallback.
    @InjectRepository(Country)
    private readonly countries?: Repository<Country>,
  ) {}

  /** Admin-managed engine config from the country row; static registry as fallback (tests/seed). */
  private async countryConfig(
    cc: string,
  ): Promise<{ name: string; suffixes: string[] }> {
    if (this.countries) {
      const row = await this.countries.findOne({ where: { isoCode: cc } });
      if (row?.officialDomains?.length) {
        return { name: row.countryName, suffixes: row.officialDomains };
      }
    }
    return { name: countryDisplayName(cc), suffixes: officialSuffixes(cc) };
  }

  /** Is this country enabled for the engine? DB-driven; static registry as fallback. */
  async isSupported(cc: string): Promise<boolean> {
    const code = cc.toUpperCase();
    if (this.countries) {
      const row = await this.countries.findOne({ where: { isoCode: code } });
      if (row) return row.govLinkEnabled && row.status === 'active';
    }
    return (SUPPORTED_COUNTRIES as readonly string[]).includes(code);
  }

  /** ISO2 → flag emoji (no stored flag needed). */
  private static isoToFlag(cc: string): string {
    return cc
      .toUpperCase()
      .replace(/[A-Z]/g, (ch) =>
        String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65),
      );
  }

  /** The countries the engine can process — DB-driven for the admin UI. */
  async listSupportedCountries(): Promise<
    Array<{ code: string; name: string; flag: string }>
  > {
    if (this.countries) {
      const rows = await this.countries.find({
        where: { govLinkEnabled: true, status: 'active' },
        order: { countryName: 'ASC' },
      });
      if (rows.length) {
        return rows
          .filter((r) => r.isoCode)
          .map((r) => ({
            code: r.isoCode as string,
            name: r.countryName,
            flag: GovLinksService.isoToFlag(r.isoCode as string),
          }));
      }
    }
    return SUPPORTED_COUNTRIES.map((c) => ({
      code: c,
      name: countryDisplayName(c),
      flag: GovLinksService.isoToFlag(c),
    }));
  }

  async list(filter: {
    countryCode?: string;
    category?: string;
    status?: string;
  }): Promise<GovLink[]> {
    const where: Record<string, string> = {};
    if (filter.countryCode)
      where.countryCode = filter.countryCode.toUpperCase();
    if (filter.category) where.category = filter.category;
    if (filter.status) where.status = filter.status;
    return this.repo.find({
      where,
      order: { countryCode: 'ASC', category: 'ASC' },
    });
  }

  // Reachability of the local AI (Ollama) and the search engine, for the admin UI.
  async checkHealth(): Promise<{
    llm: { ok: boolean; model: string; baseUrl: string };
    search: { ok: boolean; provider: string };
  }> {
    const [llmOk, searchOk] = await Promise.all([
      this.ranker.health(),
      this.search.health(),
    ]);
    return {
      llm: {
        ok: llmOk,
        model: process.env.LLM_MODEL ?? 'qwen2.5:7b-instruct',
        baseUrl: process.env.LLM_BASE_URL ?? 'http://localhost:11434/v1',
      },
      search: {
        ok: searchOk,
        provider:
          process.env.SEARCH_PROVIDER === 'tavily' ? 'tavily' : 'searxng',
      },
    };
  }

  async generate(
    countryCode: string,
    category: string,
  ): Promise<GovLinkResult> {
    const cc = countryCode.toUpperCase();
    const { name: country, suffixes: allowed } = await this.countryConfig(cc);
    const hint = this.hints
      ? await this.hints.findOneOrNull(cc, category)
      : null;

    // (b) pinnedUrl short-circuit: explicit admin override. LIVE-verify the exact URL, bypass the
    // allowlist (the admin vouched for the domain), skip the ranker, summarize its real text.
    // Schéma toléré absent : « france-visas.gouv.fr » collé tel quel dans le
    // carnet donnait un « Invalid URL » cryptique au run.
    const pinnedRaw = hint?.pinnedUrl?.trim();
    const pinned = pinnedRaw && !/^https?:\/\//i.test(pinnedRaw) ? `https://${pinnedRaw}` : pinnedRaw;
    if (pinned) {
      return this.generatePinned(cc, category, country, pinned);
    }

    // (c) hint-driven fan-out (or generic single-query fallback when no usable fiche).
    const { queries, keywords } = buildQueries(
      hint
        ? {
            officialDomains: hint.officialDomains ?? [],
            keywords: hint.keywords ?? '',
            queryLang: hint.queryLang ?? 'fr',
            excludeTerms: hint.excludeTerms ?? [],
          }
        : null,
      { countryName: country, category, countryCode: cc },
    );
    // sourceQuery / ranker context use the first query (a site:<domain> query when a fiche exists).
    const primaryQuery = queries[0];

    // Run ALL queries, then merge + dedupe candidates by normalized URL (one fetch per distinct URL).
    const rawLists = await Promise.all(
      queries.map((q) => this.searchWithRetry(q, allowed)),
    );
    const candidates = this.dedupeByUrl(rawLists.flat());
    // Cap BEFORE verifying: each verify is a live HTTP fetch, and the fan-out can surface dozens
    // of official hits — without this cap we'd burst-hammer the same government site.
    const official = candidates
      .filter((c) => isOfficialDomain(c.url, cc, allowed))
      .slice(0, GovLinksService.MAX_VERIFIED);

    // Verify candidates concurrently: each does a live HTTP fetch (up to ~10s), so running
    // them in parallel turns admin generation time from sum-of-fetches into ~the slowest one.
    // Promise.all preserves order, so verified[0] (the fallback pick) stays deterministic.
    const checked = await Promise.all(
      official.map(async (c) => {
        const v = await this.verifier.verify(c.url, keywords);
        // FIX 1: also re-validate the post-redirect finalUrl against the official-domain allowlist
        return v.live && v.matched && isOfficialDomain(v.finalUrl, cc, allowed)
          ? { ...c, url: v.finalUrl, snippet: v.text || c.snippet }
          : null;
      }),
    );
    // Re-dedupe AFTER verify: distinct candidates can redirect to the same finalUrl.
    const verified: SearchCandidate[] = this.dedupeByUrl(
      checked.filter((c): c is SearchCandidate => c !== null),
    );

    if (verified.length === 0) {
      return this.persist(
        cc,
        category,
        null,
        null,
        0,
        'needs_review',
        primaryQuery,
      );
    }
    // Les domaines de la fiche redeviennent prioritaires : s'ils comptent au
    // moins un survivant vérifié, le ranker (et le fallback) choisissent parmi
    // eux seulement.
    const shortlist = preferHintDomains(verified, hint?.officialDomains);
    const picked = await this.ranker.pickBest(primaryQuery, shortlist);
    // FIX 4: log the fallback and use named constant
    if (!picked) {
      this.logger.warn(
        `LLM ranker unavailable for ${cc}/${category}; using top verified official link as fallback.`,
      );
      const top = shortlist[0];
      const { facts, actions, offTopic } = await this.ranker.summarize(
        top.snippet ?? '',
        {
          country,
          category,
          keywords,
        },
      );
      return this.persist(
        cc,
        category,
        top.url,
        top.title,
        GovLinksService.FALLBACK_CONFIDENCE,
        'pending_review', // machine-verified → awaits HUMAN approval before publication
        primaryQuery,
        facts,
        actions,
        { pageText: top.snippet ?? '', offTopic },
      );
    }
    const chosen = shortlist[picked.index];
    // Grounded summary of the chosen official page's real content (anti-hallucination: from the page text only).
    const { facts, actions, offTopic } = await this.ranker.summarize(
      chosen.snippet ?? '',
      { country, category, keywords },
    );
    return this.persist(
      cc,
      category,
      chosen.url,
      picked.label || chosen.title,
      picked.confidence,
      'pending_review', // machine-verified → awaits HUMAN approval before publication
      primaryQuery,
      facts,
      actions,
      { pageText: chosen.snippet ?? '', offTopic },
    );
  }

  /**
   * HUMAN review of a machine-found link: approve → 'active' (published), reject →
   * 'needs_review' (stays hidden; regenerate or pin a URL in the search-hint carnet).
   */
  async reviewLink(id: number, approve: boolean): Promise<GovLink> {
    const link = await this.repo.findOne({ where: { id } });
    if (!link) {
      throw new NotFoundException(`Lien ${id} introuvable`);
    }
    if (link.status !== 'pending_review') {
      throw new BadRequestException(
        `Ce lien n'est pas en attente de validation (statut actuel : ${link.status}).`,
      );
    }
    link.status = approve ? 'active' : 'needs_review';
    return this.repo.save(link);
  }

  /**
   * pinnedUrl path: the admin pinned an exact URL. We still verify it is LIVE (a broken pin must
   * surface as needs_review, not silently publish), but the official-domain allowlist is bypassed
   * and the ranker is skipped. The grounded summary is built from the live page text only.
   */
  private async generatePinned(
    cc: string,
    category: string,
    country: string,
    pinnedUrl: string,
  ): Promise<GovLinkResult> {
    const v = await this.verifier.verify(pinnedUrl, []); // empty keywords → relevance gate is a no-op
    if (!v.live) {
      this.logger.warn(
        `Pinned URL for ${cc}/${category} is unreachable: ${pinnedUrl}`,
      );
      return this.persist(
        cc,
        category,
        pinnedUrl,
        'épinglé (injoignable)',
        0,
        'needs_review',
        pinnedUrl,
        undefined,
        undefined,
        { pinned: true },
      );
    }
    const finalUrl = v.finalUrl || pinnedUrl;
    const { facts, actions, offTopic } = await this.ranker.summarize(
      v.text ?? '',
      { country, category },
    );
    return this.persist(
      cc,
      category,
      finalUrl,
      'épinglé',
      GovLinksService.PINNED_CONFIDENCE,
      'active',
      pinnedUrl,
      facts,
      actions,
      { pageText: v.text ?? '', offTopic, pinned: true },
    );
  }

  /**
   * One retry on transient search failures (SearXNG hiccup, timeout): a single blip must
   * not silently empty a category. Still returns [] after the retry — generation degrades
   * to needs_review instead of crashing.
   */
  private async searchWithRetry(
    query: string,
    allowed: string[],
  ): Promise<SearchCandidate[]> {
    try {
      return await this.search.search(query, allowed);
    } catch {
      await new Promise((r) => setTimeout(r, 1200));
      try {
        return await this.search.search(query, allowed);
      } catch (e) {
        this.logger.warn(
          `Search failed twice for "${query.slice(0, 60)}…": ${(e as Error)?.message}`,
        );
        return [];
      }
    }
  }

  /** Normalize a URL for dedupe: lowercased host, no trailing slash on the path, no hash. */
  private normalizeUrl(url: string): string {
    try {
      const u = new URL(url);
      const path = u.pathname.replace(/\/+$/, '') || '/';
      return `${u.protocol}//${u.host}${path}${u.search}`.toLowerCase();
    } catch {
      return url.trim().toLowerCase();
    }
  }

  /** Keep the first occurrence of each distinct (normalized) URL; preserves order. */
  private dedupeByUrl<T extends { url: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const it of items) {
      const key = this.normalizeUrl(it.url);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  }

  private async persist(
    countryCode: string,
    category: string,
    url: string | null,
    label: string | null,
    confidence: number,
    status: GovLinkStatus,
    query: string,
    summary?: string[],
    actions?: string[],
    // Transportés dans le RÉSULTAT pour les garde-fous de l'orchestrateur ; jamais en base.
    extras?: { pageText?: string; offTopic?: boolean; pinned?: boolean },
  ): Promise<GovLinkResult> {
    if (url) {
      // FIX 2: upsert by (countryCode, category) — one row per pair, no duplicates
      const data = {
        countryCode,
        category,
        url,
        label: label ?? url,
        sourceQuery: query,
        confidence,
        verifiedAt: new Date(),
        status,
        summary: summary?.length ? summary : null,
        actions: actions?.length ? actions : null,
      };
      const existing = await this.repo.findOne({
        where: { countryCode, category },
      });
      // Don't UN-PUBLISH an already-approved link on a re-run: if it's 'active', the URL is
      // unchanged, and the incoming verdict is the machine 'pending_review', keep it published
      // (a human already approved this exact link). A different URL / needs_review still applies.
      if (
        existing?.status === 'active' &&
        existing.url === url &&
        status === 'pending_review'
      ) {
        data.status = 'active';
      }
      await this.repo.save(
        existing ? { ...existing, ...data } : this.repo.create(data),
      );
    }
    return {
      countryCode,
      category,
      url,
      label,
      confidence,
      status,
      summary,
      actions,
      pageText: extras?.pageText,
      offTopic: extras?.offTopic,
      pinned: extras?.pinned,
    };
  }

  private countryName(code: string): string {
    return countryDisplayName(code);
  }
}
