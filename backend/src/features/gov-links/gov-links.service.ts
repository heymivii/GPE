import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovLink } from './entities/gov-link.entity';
import { buildQuery } from './query-builder';
import { isOfficialDomain, officialSuffixes } from './official-domains';
import { SearchProvider } from './search-provider';
import { LinkVerifier } from './link-verifier';
import { LlmRanker } from './llm-ranker';
import { SearchCandidate, GovLinkStatus } from './gov-links.types';

export const SEARCH_PROVIDER = 'SEARCH_PROVIDER';
export const LLM_RANKER = 'LLM_RANKER';

export interface GovLinkResult {
  countryCode: string; category: string;
  url: string | null; label: string | null;
  confidence: number; status: GovLinkStatus;
  summary?: string[];
}

@Injectable()
export class GovLinksService {
  private readonly logger = new Logger(GovLinksService.name);
  private static readonly FALLBACK_CONFIDENCE = 0.5;

  constructor(
    @InjectRepository(GovLink) private readonly repo: Repository<GovLink>,
    @Inject(SEARCH_PROVIDER) private readonly search: SearchProvider,
    private readonly verifier: LinkVerifier,
    @Inject(LLM_RANKER) private readonly ranker: LlmRanker,
  ) {}

  async list(filter: { countryCode?: string; category?: string; status?: string }): Promise<GovLink[]> {
    const where: Record<string, string> = {};
    if (filter.countryCode) where.countryCode = filter.countryCode.toUpperCase();
    if (filter.category) where.category = filter.category;
    if (filter.status) where.status = filter.status;
    return this.repo.find({ where, order: { countryCode: 'ASC', category: 'ASC' } });
  }

  // Reachability of the local AI (Ollama) and the search engine, for the admin UI.
  async checkHealth(): Promise<{
    llm: { ok: boolean; model: string; baseUrl: string };
    search: { ok: boolean; provider: string };
  }> {
    const [llmOk, searchOk] = await Promise.all([this.ranker.health(), this.search.health()]);
    return {
      llm: {
        ok: llmOk,
        model: process.env.LLM_MODEL ?? 'qwen2.5:7b-instruct',
        baseUrl: process.env.LLM_BASE_URL ?? 'http://localhost:11434/v1',
      },
      search: { ok: searchOk, provider: process.env.SEARCH_PROVIDER === 'tavily' ? 'tavily' : 'searxng' },
    };
  }

  async generate(countryCode: string, category: string): Promise<GovLinkResult> {
    const { query, keywords } = buildQuery(this.countryName(countryCode), category);
    const raw = await this.search.search(query, officialSuffixes(countryCode));
    const official = raw.filter((c) => isOfficialDomain(c.url, countryCode));

    // Verify candidates concurrently: each does a live HTTP fetch (up to ~10s), so running
    // them in parallel turns admin generation time from sum-of-fetches into ~the slowest one.
    // Promise.all preserves order, so verified[0] (the fallback pick) stays deterministic.
    const checked = await Promise.all(
      official.map(async (c) => {
        const v = await this.verifier.verify(c.url, keywords);
        // FIX 1: also re-validate the post-redirect finalUrl against the official-domain allowlist
        return v.live && v.matched && isOfficialDomain(v.finalUrl, countryCode)
          ? { ...c, url: v.finalUrl, snippet: v.text || c.snippet }
          : null;
      }),
    );
    const verified: SearchCandidate[] = checked.filter((c): c is SearchCandidate => c !== null);

    if (verified.length === 0) {
      return this.persist(countryCode, category, null, null, 0, 'needs_review', query);
    }
    const picked = await this.ranker.pickBest(query, verified);
    // FIX 4: log the fallback and use named constant
    if (!picked) {
      this.logger.warn(`LLM ranker unavailable for ${countryCode}/${category}; using top verified official link as fallback.`);
      const top = verified[0];
      const summary = await this.ranker.summarize(top.snippet ?? '', { country: this.countryName(countryCode), category });
      return this.persist(countryCode, category, top.url, top.title, GovLinksService.FALLBACK_CONFIDENCE, 'active', query, summary);
    }
    const chosen = verified[picked.index];
    // Grounded summary of the chosen official page's real content (anti-hallucination: from the page text only).
    const summary = await this.ranker.summarize(chosen.snippet ?? '', { country: this.countryName(countryCode), category });
    return this.persist(countryCode, category, chosen.url, picked.label || chosen.title, picked.confidence, 'active', query, summary);
  }

  private async persist(
    countryCode: string, category: string, url: string | null, label: string | null,
    confidence: number, status: GovLinkStatus, query: string, summary?: string[],
  ): Promise<GovLinkResult> {
    if (url) {
      // FIX 2: upsert by (countryCode, category) — one row per pair, no duplicates
      const data = {
        countryCode, category, url, label: label ?? url, sourceQuery: query,
        confidence, verifiedAt: new Date(), status, summary: summary?.length ? summary : null,
      };
      const existing = await this.repo.findOne({ where: { countryCode, category } });
      await this.repo.save(existing ? { ...existing, ...data } : this.repo.create(data));
    }
    return { countryCode, category, url, label, confidence, status, summary };
  }

  private countryName(code: string): string {
    return ({ FR: 'France', US: 'United States', JP: 'Japan', CH: 'Switzerland' } as Record<string, string>)[code.toUpperCase()] ?? code;
  }
}
