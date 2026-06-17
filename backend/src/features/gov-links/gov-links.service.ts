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
}

@Injectable()
export class GovLinksService {
  private readonly logger = new Logger(GovLinksService.name);
  constructor(
    @InjectRepository(GovLink) private readonly repo: Repository<GovLink>,
    @Inject(SEARCH_PROVIDER) private readonly search: SearchProvider,
    private readonly verifier: LinkVerifier,
    @Inject(LLM_RANKER) private readonly ranker: LlmRanker,
  ) {}

  async generate(countryCode: string, category: string): Promise<GovLinkResult> {
    const { query, keywords } = buildQuery(this.countryName(countryCode), category);
    const raw = await this.search.search(query, officialSuffixes(countryCode));
    const official = raw.filter((c) => isOfficialDomain(c.url, countryCode));

    const verified: SearchCandidate[] = [];
    for (const c of official) {
      const v = await this.verifier.verify(c.url, keywords);
      if (v.live && v.matched) verified.push({ ...c, url: v.finalUrl });
    }

    if (verified.length === 0) {
      return this.persist(countryCode, category, null, null, 0, 'needs_review', query);
    }
    const picked = await this.ranker.pickBest(query, verified);
    if (!picked) {
      const top = verified[0];
      return this.persist(countryCode, category, top.url, top.title, 0.5, 'active', query);
    }
    const chosen = verified[picked.index];
    return this.persist(countryCode, category, chosen.url, picked.label || chosen.title, picked.confidence, 'active', query);
  }

  private async persist(
    countryCode: string, category: string, url: string | null, label: string | null,
    confidence: number, status: GovLinkStatus, query: string,
  ): Promise<GovLinkResult> {
    if (url) {
      const entity = this.repo.create({
        countryCode, category, url, label: label ?? url, sourceQuery: query,
        confidence, verifiedAt: new Date(), status,
      });
      await this.repo.save(entity);
    }
    return { countryCode, category, url, label, confidence, status };
  }

  private countryName(code: string): string {
    return ({ FR: 'France', US: 'United States', JP: 'Japan', CH: 'Switzerland' } as Record<string, string>)[code.toUpperCase()] ?? code;
  }
}
