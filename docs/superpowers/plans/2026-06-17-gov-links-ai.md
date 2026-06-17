# Gov-Links AI (grounded, no-hallucination) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a backend engine that retrieves & verifies official government/reference links per (country, service-category) using grounded web search + live verification + a local-AI ranker, persisting results in a `gov_link` table — with hallucination impossible by construction (the AI only picks among real, verified candidates).

**Architecture:** NestJS feature module `gov-links`. Pure units (domain allowlist, query builder, link verifier) + two swappable adapters behind interfaces (`SearchProvider` = Tavily, `LlmRanker` = Ollama/OpenAI-compatible). A `GovLinksService` orchestrates: build query → search → keep official domains → verify live → AI ranks the verified candidates → upsert `gov_link`. Generation is admin-triggered/local; prod reads the table.

**Tech Stack:** NestJS · TypeORM (Postgres) · Jest · Tavily Search API · Ollama (`qwen2.5:7b-instruct`, OpenAI-compatible endpoint).

**Spec:** `docs/superpowers/specs/2026-06-17-gov-links-ai-design.md`

---

## File structure (backend `backend/src/features/gov-links/`)
- `gov-links.types.ts` — shared types + canonical categories
- `entities/gov-link.entity.ts` — `GovLink` entity
- `official-domains.ts` — official-domain allowlist + `isOfficialDomain()`
- `query-builder.ts` — `buildQuery(countryName, category)`
- `link-verifier.ts` — `LinkVerifier` (live HTTP + keyword match)
- `search-provider.ts` — `SearchProvider` interface + `TavilySearchProvider`
- `llm-ranker.ts` — `LlmRanker` interface + `OllamaRanker` + index guard
- `gov-links.service.ts` — orchestrator
- `gov-links.controller.ts` — admin endpoint
- `gov-links.module.ts` — module
- `backend/src/db/migrations/<ts>-AddGovLink.ts` — table
- Modify `backend/src/app.module.ts` — register module

> **Out of scope (separate follow-up plan):** front-end consumption (checklist + services pages reading `gov_link`). This plan delivers the backend engine + admin endpoint, working & tested on its own.

---

### Task 1: Shared types & canonical categories

**Files:**
- Create: `backend/src/features/gov-links/gov-links.types.ts`

- [ ] **Step 1: Create the types file**

```ts
export interface SearchCandidate {
  url: string;
  title: string;
  snippet: string;
}

export interface RankResult {
  index: number;      // index INTO the candidates array (never a free URL)
  label: string;
  confidence: number; // 0..1
}

export type GovLinkStatus = 'active' | 'needs_review' | 'dead';

// Canonical service categories (aligned with services-config.ts).
export const CANONICAL_CATEGORIES = [
  'emploi', 'logement', 'transport', 'sante', 'demarches',
  'education', 'culture', 'business', 'visa', 'banque', 'demarches-admin',
] as const;
export type Category = (typeof CANONICAL_CATEGORIES)[number];
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/features/gov-links/gov-links.types.ts
git commit -m "feat(gov-links): shared types + canonical categories"
```

---

### Task 2: `GovLink` entity + migration

**Files:**
- Create: `backend/src/features/gov-links/entities/gov-link.entity.ts`
- Create: `backend/src/db/migrations/1781950000000-AddGovLink.ts`

- [ ] **Step 1: Create the entity**

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'gov_link' })
export class GovLink {
  @PrimaryGeneratedColumn({ name: 'id_gov_link' })
  id: number;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode: string;

  @Column({ name: 'category', type: 'varchar', length: 50 })
  category: string;

  @Column({ name: 'label', type: 'varchar', length: 255 })
  label: string;

  @Column({ name: 'url', type: 'text' })
  url: string;

  @Column({ name: 'source_query', type: 'text', nullable: true })
  sourceQuery?: string;

  @Column({ name: 'confidence', type: 'float', default: 0 })
  confidence: number;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'active' })
  status: string;
}
```

- [ ] **Step 2: Create the migration**

```ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGovLink1781950000000 implements MigrationInterface {
  name = 'AddGovLink1781950000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "gov_link" (
        "id_gov_link"  SERIAL        NOT NULL,
        "country_code" VARCHAR(2)    NOT NULL,
        "category"     VARCHAR(50)   NOT NULL,
        "label"        VARCHAR(255)  NOT NULL,
        "url"          TEXT          NOT NULL,
        "source_query" TEXT          NULL,
        "confidence"   DOUBLE PRECISION NOT NULL DEFAULT 0,
        "verified_at"  TIMESTAMP     NULL,
        "status"       VARCHAR(20)   NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_gov_link" PRIMARY KEY ("id_gov_link"),
        CONSTRAINT "UQ_gov_link_country_cat_url" UNIQUE ("country_code","category","url")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "gov_link"`);
  }
}
```

- [ ] **Step 3: Verify it compiles** — Run: `cd backend && npx tsc --noEmit -p tsconfig.json` · Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/features/gov-links/entities/gov-link.entity.ts backend/src/db/migrations/1781950000000-AddGovLink.ts
git commit -m "feat(gov-links): GovLink entity + migration"
```

---

### Task 3: Official-domain allowlist (pure, TDD)

**Files:**
- Create: `backend/src/features/gov-links/official-domains.ts`
- Test: `backend/src/features/gov-links/official-domains.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { isOfficialDomain } from './official-domains';

describe('isOfficialDomain', () => {
  it('accepts an official FR domain', () => {
    expect(isOfficialDomain('https://france-visas.gouv.fr/en/etudiant', 'FR')).toBe(true);
    expect(isOfficialDomain('https://www.service-public.fr/x', 'FR')).toBe(true);
  });
  it('rejects a non-official domain', () => {
    expect(isOfficialDomain('https://blog-immigration.com/visa', 'FR')).toBe(false);
  });
  it('accepts a US .gov and rejects .com', () => {
    expect(isOfficialDomain('https://travel.state.gov/visa', 'US')).toBe(true);
    expect(isOfficialDomain('https://visa-help.com', 'US')).toBe(false);
  });
  it('returns false on a malformed url', () => {
    expect(isOfficialDomain('not a url', 'FR')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — Run: `cd backend && npx jest official-domains -v` · Expected: FAIL ("Cannot find module './official-domains'").

- [ ] **Step 3: Write minimal implementation**

```ts
// Official / authoritative domains per supported country (suffix match on hostname).
const OFFICIAL_SUFFIXES: Record<string, string[]> = {
  FR: ['gouv.fr', 'service-public.fr', 'ameli.fr', 'campusfrance.org'],
  US: ['.gov', 'uscis.gov', 'state.gov'],
  JP: ['go.jp', 'moj.go.jp', 'isa.go.jp'],
  CH: ['admin.ch', 'ch.ch'],
};

export function officialSuffixes(countryCode: string): string[] {
  return OFFICIAL_SUFFIXES[countryCode.toUpperCase()] ?? [];
}

export function isOfficialDomain(url: string, countryCode: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return officialSuffixes(countryCode).some(
    (sfx) => host === sfx || host.endsWith(sfx.startsWith('.') ? sfx : `.${sfx}`) || host.endsWith(sfx),
  );
}
```

- [ ] **Step 4: Run test to verify it passes** — Run: `cd backend && npx jest official-domains -v` · Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/gov-links/official-domains.ts backend/src/features/gov-links/official-domains.spec.ts
git commit -m "feat(gov-links): official-domain allowlist (tested)"
```

---

### Task 4: Query builder (pure, TDD)

**Files:**
- Create: `backend/src/features/gov-links/query-builder.ts`
- Test: `backend/src/features/gov-links/query-builder.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { buildQuery } from './query-builder';

describe('buildQuery', () => {
  it('builds a query + keywords for a known category', () => {
    const { query, keywords } = buildQuery('France', 'visa');
    expect(query.toLowerCase()).toContain('france');
    expect(query.toLowerCase()).toContain('visa');
    expect(keywords).toContain('visa');
  });
  it('falls back gracefully for an unknown category', () => {
    const { query, keywords } = buildQuery('Japan', 'unknown-cat');
    expect(query.toLowerCase()).toContain('japan');
    expect(Array.isArray(keywords)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — Run: `cd backend && npx jest query-builder -v` · Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

```ts
const CATEGORY_TERMS: Record<string, { terms: string; keywords: string[] }> = {
  visa:               { terms: 'official visa application',           keywords: ['visa', 'immigration'] },
  demarches:          { terms: 'official residence permit procedure', keywords: ['residence', 'permit', 'immigration'] },
  'demarches-admin':  { terms: 'official administrative procedures',  keywords: ['administration', 'official'] },
  logement:           { terms: 'official housing rental information', keywords: ['housing', 'rental'] },
  sante:              { terms: 'official health insurance system',    keywords: ['health', 'insurance'] },
  emploi:             { terms: 'official employment work permit',     keywords: ['work', 'employment'] },
  banque:             { terms: 'open a bank account official guide',  keywords: ['bank', 'account'] },
  transport:          { terms: 'official public transport authority', keywords: ['transport'] },
  education:          { terms: 'official education enrollment',        keywords: ['education', 'school'] },
};

export function buildQuery(
  countryName: string,
  category: string,
): { query: string; keywords: string[] } {
  const entry = CATEGORY_TERMS[category] ?? { terms: 'official government information', keywords: [] };
  return {
    query: `${countryName} ${entry.terms} official government site`,
    keywords: entry.keywords,
  };
}
```

- [ ] **Step 4: Run test to verify it passes** — Run: `cd backend && npx jest query-builder -v` · Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/gov-links/query-builder.ts backend/src/features/gov-links/query-builder.spec.ts
git commit -m "feat(gov-links): query builder (tested)"
```

---

### Task 5: Link verifier (live check + keyword match, TDD via injected probe)

**Files:**
- Create: `backend/src/features/gov-links/link-verifier.ts`
- Test: `backend/src/features/gov-links/link-verifier.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { LinkVerifier } from './link-verifier';

describe('LinkVerifier', () => {
  it('marks a 200 page with a matching keyword as verified', async () => {
    const v = new LinkVerifier(async () => ({ ok: true, finalUrl: 'https://x.gouv.fr/visa', text: 'Demande de VISA en ligne' }));
    const r = await v.verify('https://x.gouv.fr/visa', ['visa']);
    expect(r.live).toBe(true);
    expect(r.matched).toBe(true);
  });
  it('marks a dead page as not live', async () => {
    const v = new LinkVerifier(async () => ({ ok: false, finalUrl: '', text: '' }));
    const r = await v.verify('https://x.gouv.fr/dead', ['visa']);
    expect(r.live).toBe(false);
  });
  it('live but keyword absent → matched false', async () => {
    const v = new LinkVerifier(async () => ({ ok: true, finalUrl: 'https://x.gouv.fr/p', text: 'unrelated page' }));
    const r = await v.verify('https://x.gouv.fr/p', ['visa']);
    expect(r.live).toBe(true);
    expect(r.matched).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — Run: `cd backend && npx jest link-verifier -v` · Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

```ts
import axios from 'axios';

export interface ProbeResult { ok: boolean; finalUrl: string; text: string; }
export type HttpProbe = (url: string) => Promise<ProbeResult>;

const defaultProbe: HttpProbe = async (url) => {
  try {
    const res = await axios.get<string>(url, {
      timeout: 10000,
      maxRedirects: 5,
      responseType: 'text',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SkyWalkBot/1.0)' },
      validateStatus: (s) => s >= 200 && s < 400,
    });
    const finalUrl = res.request?.res?.responseUrl ?? url;
    return { ok: true, finalUrl, text: typeof res.data === 'string' ? res.data : '' };
  } catch {
    return { ok: false, finalUrl: '', text: '' };
  }
};

export class LinkVerifier {
  constructor(private readonly probe: HttpProbe = defaultProbe) {}

  async verify(url: string, keywords: string[]): Promise<{ live: boolean; finalUrl: string; matched: boolean }> {
    const r = await this.probe(url);
    if (!r.ok) return { live: false, finalUrl: '', matched: false };
    const hay = `${r.text}`.toLowerCase();
    const matched = keywords.length === 0 || keywords.some((k) => hay.includes(k.toLowerCase()));
    return { live: true, finalUrl: r.finalUrl || url, matched };
  }
}
```

- [ ] **Step 4: Run test to verify it passes** — Run: `cd backend && npx jest link-verifier -v` · Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/gov-links/link-verifier.ts backend/src/features/gov-links/link-verifier.spec.ts
git commit -m "feat(gov-links): link verifier with injected probe (tested)"
```

---

### Task 6: SearchProvider interface + Tavily adapter

**Files:**
- Create: `backend/src/features/gov-links/search-provider.ts`

- [ ] **Step 1: Create the interface + Tavily adapter**

```ts
import axios from 'axios';
import { SearchCandidate } from './gov-links.types';

export interface SearchProvider {
  search(query: string, allowedDomains: string[]): Promise<SearchCandidate[]>;
}

export class TavilySearchProvider implements SearchProvider {
  constructor(
    private readonly apiKey = process.env.TAVILY_API_KEY ?? '',
    private readonly baseUrl = 'https://api.tavily.com',
  ) {}

  async search(query: string, allowedDomains: string[]): Promise<SearchCandidate[]> {
    if (!this.apiKey) return [];
    const { data } = await axios.post<{ results?: Array<{ url: string; title: string; content: string }> }>(
      `${this.baseUrl}/search`,
      {
        api_key: this.apiKey,
        query,
        max_results: 8,
        include_domains: allowedDomains.length ? allowedDomains : undefined,
      },
      { timeout: 15000 },
    );
    return (data.results ?? []).map((r) => ({ url: r.url, title: r.title, snippet: r.content }));
  }
}
```

- [ ] **Step 2: Verify it compiles** — Run: `cd backend && npx tsc --noEmit -p tsconfig.json` · Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/features/gov-links/search-provider.ts
git commit -m "feat(gov-links): SearchProvider interface + Tavily adapter"
```

---

### Task 7: LlmRanker interface + Ollama adapter + index guard (TDD)

**Files:**
- Create: `backend/src/features/gov-links/llm-ranker.ts`
- Test: `backend/src/features/gov-links/llm-ranker.spec.ts`

- [ ] **Step 1: Write the failing test** (guards: the ranker NEVER returns a URL outside the candidate list)

```ts
import { clampRankResult } from './llm-ranker';

describe('clampRankResult', () => {
  const candidates = [{ url: 'a', title: 't', snippet: 's' }, { url: 'b', title: 't', snippet: 's' }];
  it('keeps a valid index', () => {
    expect(clampRankResult({ index: 1, label: 'B', confidence: 0.9 }, candidates)).toEqual({ index: 1, label: 'B', confidence: 0.9 });
  });
  it('rejects an out-of-range index → null (no hallucination)', () => {
    expect(clampRankResult({ index: 5, label: 'X', confidence: 0.9 }, candidates)).toBeNull();
    expect(clampRankResult({ index: -1, label: 'X', confidence: 0.9 }, candidates)).toBeNull();
  });
  it('clamps confidence to 0..1', () => {
    expect(clampRankResult({ index: 0, label: 'A', confidence: 5 }, candidates)?.confidence).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — Run: `cd backend && npx jest llm-ranker -v` · Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

```ts
import axios from 'axios';
import { SearchCandidate, RankResult } from './gov-links.types';

export interface LlmRanker {
  pickBest(query: string, candidates: SearchCandidate[]): Promise<RankResult | null>;
}

// Anti-hallucination guard: the model may only return an index INTO the candidate list.
export function clampRankResult(raw: RankResult, candidates: SearchCandidate[]): RankResult | null {
  if (!Number.isInteger(raw.index) || raw.index < 0 || raw.index >= candidates.length) return null;
  return { index: raw.index, label: String(raw.label ?? '').slice(0, 200), confidence: Math.max(0, Math.min(1, raw.confidence ?? 0)) };
}

export class OllamaRanker implements LlmRanker {
  constructor(
    private readonly baseUrl = process.env.LLM_BASE_URL ?? 'http://localhost:11434/v1',
    private readonly model = process.env.LLM_MODEL ?? 'qwen2.5:7b-instruct',
    private readonly apiKey = process.env.LLM_API_KEY ?? 'ollama',
  ) {}

  async pickBest(query: string, candidates: SearchCandidate[]): Promise<RankResult | null> {
    if (candidates.length === 0) return null;
    const list = candidates.map((c, i) => `${i}: ${c.title} — ${c.url}`).join('\n');
    const prompt = `Query: "${query}".\nCandidates (official, already verified):\n${list}\n\nReturn STRICT JSON {"index": <number from the list>, "label": "<short human label>", "confidence": <0..1>}. The index MUST be one of the listed numbers. Do not invent URLs.`;
    try {
      const { data } = await axios.post<{ choices: Array<{ message: { content: string } }> }>(
        `${this.baseUrl}/chat/completions`,
        { model: this.model, messages: [{ role: 'user', content: prompt }], temperature: 0, response_format: { type: 'json_object' } },
        { timeout: 30000, headers: { Authorization: `Bearer ${this.apiKey}` } },
      );
      const raw = JSON.parse(data.choices[0].message.content) as RankResult;
      return clampRankResult(raw, candidates);
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes** — Run: `cd backend && npx jest llm-ranker -v` · Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/gov-links/llm-ranker.ts backend/src/features/gov-links/llm-ranker.spec.ts
git commit -m "feat(gov-links): LlmRanker interface + Ollama adapter + index guard (tested)"
```

---

### Task 8: GovLinksService orchestration (TDD with mocked deps)

**Files:**
- Create: `backend/src/features/gov-links/gov-links.service.ts`
- Test: `backend/src/features/gov-links/gov-links.service.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { GovLinksService } from './gov-links.service';

const candidate = (url: string) => ({ url, title: 't', snippet: 's' });
function makeRepo() { return { findOne: jest.fn(), create: jest.fn((x) => ({ ...x })), save: jest.fn(async (e) => ({ ...e, id: 1 })) }; }

describe('GovLinksService.generate', () => {
  it('returns needs_review when no candidate is verified', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn(async () => [candidate('https://x.com/a')]) };          // non-official
    const verifier = { verify: jest.fn(async () => ({ live: false, finalUrl: '', matched: false })) };
    const ranker = { pickBest: jest.fn() };
    const svc = new GovLinksService(repo as never, search as never, verifier as never, ranker as never);
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('needs_review');
    expect(ranker.pickBest).not.toHaveBeenCalled();
  });

  it('persists an active link chosen by the ranker among verified official candidates', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn(async () => [candidate('https://france-visas.gouv.fr/etudiant')]) };
    const verifier = { verify: jest.fn(async () => ({ live: true, finalUrl: 'https://france-visas.gouv.fr/etudiant', matched: true })) };
    const ranker = { pickBest: jest.fn(async () => ({ index: 0, label: 'France-Visas', confidence: 0.9 })) };
    const svc = new GovLinksService(repo as never, search as never, verifier as never, ranker as never);
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('active');
    expect(res.url).toBe('https://france-visas.gouv.fr/etudiant');
    expect(res.label).toBe('France-Visas');
    expect(repo.save).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — Run: `cd backend && npx jest gov-links.service -v` · Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

```ts
import { Injectable, Logger } from '@nestjs/common';
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
    private readonly search: SearchProvider,
    private readonly verifier: LinkVerifier,
    private readonly ranker: LlmRanker,
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
```

- [ ] **Step 4: Run test to verify it passes** — Run: `cd backend && npx jest gov-links.service -v` · Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/gov-links/gov-links.service.ts backend/src/features/gov-links/gov-links.service.spec.ts
git commit -m "feat(gov-links): orchestration service (tested: needs_review + active paths)"
```

---

### Task 9: Admin controller + module + registration

**Files:**
- Create: `backend/src/features/gov-links/gov-links.controller.ts`
- Create: `backend/src/features/gov-links/gov-links.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create the controller** (admin-only — it triggers outbound calls)

```ts
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
```

- [ ] **Step 2: Create the module**

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovLinksController } from './gov-links.controller';
import { GovLinksService } from './gov-links.service';
import { GovLink } from './entities/gov-link.entity';
import { LinkVerifier } from './link-verifier';
import { TavilySearchProvider } from './search-provider';
import { OllamaRanker } from './llm-ranker';

@Module({
  imports: [TypeOrmModule.forFeature([GovLink])],
  controllers: [GovLinksController],
  providers: [
    GovLinksService,
    LinkVerifier,
    { provide: 'SearchProviderImpl', useClass: TavilySearchProvider },
    { provide: 'LlmRankerImpl', useClass: OllamaRanker },
    { provide: TavilySearchProvider, useClass: TavilySearchProvider },
    { provide: OllamaRanker, useClass: OllamaRanker },
  ],
})
export class GovLinksModule {}
```

> **Note:** `GovLinksService` constructor uses `SearchProvider`/`LinkVerifier`/`LlmRanker`. Wire them concretely: register `LinkVerifier`, `TavilySearchProvider`, `OllamaRanker` as providers and inject the concrete classes in the service constructor (replace the interface params with the concrete classes, or use `@Inject('SearchProviderImpl')`). For the MVP, inject the concrete classes directly: change the service constructor params to `search: TavilySearchProvider`, `ranker: OllamaRanker` (the unit test still passes — it injects mocks positionally).

- [ ] **Step 3: Adjust service constructor to inject concrete providers**

In `gov-links.service.ts`, change the constructor types so Nest can resolve them:
```ts
import { TavilySearchProvider } from './search-provider';
import { OllamaRanker } from './llm-ranker';
// ...
  constructor(
    @InjectRepository(GovLink) private readonly repo: Repository<GovLink>,
    private readonly search: TavilySearchProvider,
    private readonly verifier: LinkVerifier,
    private readonly ranker: OllamaRanker,
  ) {}
```
(Type the fields as the concrete classes; they structurally satisfy `SearchProvider`/`LlmRanker`. The spec test injects mocks positionally via `as never`, so it stays green.)

Simplify the module providers to:
```ts
  providers: [GovLinksService, LinkVerifier, TavilySearchProvider, OllamaRanker],
```

- [ ] **Step 4: Register the module in `app.module.ts`**

Add import near the other feature modules:
```ts
import { GovLinksModule } from './features/gov-links/gov-links.module';
```
Add `GovLinksModule,` to the `imports: [...]` array.

- [ ] **Step 5: Verify compile + full test suite**

Run: `cd backend && npx tsc --noEmit -p tsconfig.json` · Expected: 0 errors.
Run: `cd backend && npm test` · Expected: all suites pass (incl. the new gov-links specs).

- [ ] **Step 6: Commit**

```bash
git add backend/src/features/gov-links/gov-links.controller.ts backend/src/features/gov-links/gov-links.module.ts backend/src/features/gov-links/gov-links.service.ts backend/src/app.module.ts
git commit -m "feat(gov-links): admin endpoint + module wiring"
```

---

## After the plan
- **Manual smoke test (local, with Ollama running + `TAVILY_API_KEY` set):** run the migration (`npm run migration:run`), start backend, `POST /gov-links/generate?country=FR&category=visa` as admin → expect a `gov_link` row with an official `france-visas.gouv.fr` URL, `status: active`.
- **Follow-up plan (separate):** front-end consumption — checklist + services pages read `gov_link` instead of the static files; seed `gov_link` from current `checklist-links.ts`.
