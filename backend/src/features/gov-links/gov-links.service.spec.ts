import { GovLinksService } from './gov-links.service';

const candidate = (url: string) => ({ url, title: 't', snippet: 's' });
function makeRepo() {
  return {
    findOne: jest.fn(),
    find: jest.fn(async () => [{ id: 1 }]),
    create: jest.fn((x) => ({ ...x })),
    save: jest.fn(async (e) => ({ ...e, id: 1 })),
  };
}

describe('GovLinksService.generate', () => {
  it('returns needs_review when no candidate is verified', async () => {
    const repo = makeRepo();
    const search = {
      search: jest.fn(async () => [candidate('https://x.com/a')]),
    }; // non-official
    const verifier = {
      verify: jest.fn(async () => ({
        live: false,
        finalUrl: '',
        matched: false,
      })),
    };
    const ranker = {
      pickBest: jest.fn(),
      summarize: jest.fn(async () => ({ facts: [], actions: [] })),
    };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('needs_review');
    expect(ranker.pickBest).not.toHaveBeenCalled();
  });

  it('persists the ranker-chosen link as pending_review (human gate before publication)', async () => {
    const repo = makeRepo();
    const search = {
      search: jest.fn(async () => [
        candidate('https://france-visas.gouv.fr/etudiant'),
      ]),
    };
    const verifier = {
      verify: jest.fn(async () => ({
        live: true,
        finalUrl: 'https://france-visas.gouv.fr/etudiant',
        matched: true,
      })),
    };
    const ranker = {
      pickBest: jest.fn(async () => ({
        index: 0,
        label: 'France-Visas',
        confidence: 0.9,
      })),
      summarize: jest.fn(async () => []),
    };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('pending_review'); // machine-verified → awaits human approval
    expect(res.url).toBe('https://france-visas.gouv.fr/etudiant');
    expect(res.label).toBe('France-Visas');
    expect(repo.save).toHaveBeenCalled();
  });

  // FIX 1: redirect to non-official domain → needs_review
  it('redirect-to-non-official → needs_review', async () => {
    const repo = makeRepo();
    const search = {
      search: jest.fn(async () => [
        candidate('https://france-visas.gouv.fr/x'),
      ]),
    };
    // verifier returns finalUrl pointing to a non-official host
    const verifier = {
      verify: jest.fn(async () => ({
        live: true,
        finalUrl: 'https://evil.com/x',
        matched: true,
      })),
    };
    const ranker = {
      pickBest: jest.fn(),
      summarize: jest.fn(async () => ({ facts: [], actions: [] })),
    };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('needs_review');
    expect(ranker.pickBest).not.toHaveBeenCalled();
  });

  // FIX 4: Ollama fallback (pickBest returns null) → active top link
  it('Ollama fallback (pickBest=null) → pending_review top link', async () => {
    const repo = makeRepo();
    const search = {
      search: jest.fn(async () => [
        candidate('https://france-visas.gouv.fr/x'),
      ]),
    };
    const verifier = {
      verify: jest.fn(async () => ({
        live: true,
        finalUrl: 'https://france-visas.gouv.fr/x',
        matched: true,
      })),
    };
    const ranker = {
      pickBest: jest.fn(async () => null),
      summarize: jest.fn(async () => []),
    };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('pending_review'); // fallback pick also awaits human approval
    expect(res.url).toBe('https://france-visas.gouv.fr/x');
    expect(repo.save).toHaveBeenCalled();
  });

  it('list({ countryCode: "fr", status: "active" }) calls repo.find with uppercased country and returns result', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn() };
    const verifier = { verify: jest.fn() };
    const ranker = {
      pickBest: jest.fn(),
      summarize: jest.fn(async () => ({ facts: [], actions: [] })),
    };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
    );
    const result = await svc.list({ countryCode: 'fr', status: 'active' });
    expect(repo.find).toHaveBeenCalledWith({
      where: { countryCode: 'FR', status: 'active' },
      order: { countryCode: 'ASC', category: 'ASC' },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('stores the grounded summary and actions returned by the ranker', async () => {
    const repo = makeRepo();
    const search = {
      search: jest.fn(async () => [
        candidate('https://france-visas.gouv.fr/x'),
      ]),
    };
    const verifier = {
      verify: jest.fn(async () => ({
        live: true,
        finalUrl: 'https://france-visas.gouv.fr/x',
        matched: true,
      })),
    };
    const ranker = {
      pickBest: jest.fn(async () => ({
        index: 0,
        label: 'L',
        confidence: 0.9,
      })),
      summarize: jest.fn(async () => ({
        facts: ['Inscription obligatoire', 'Gratuit'],
        actions: ['Préparer un passeport valide', 'Remplir le formulaire'],
      })),
    };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(res.summary).toEqual(['Inscription obligatoire', 'Gratuit']);
    expect(res.actions).toEqual([
      'Préparer un passeport valide',
      'Remplir le formulaire',
    ]);
    expect(repo.save.mock.calls[0][0].summary).toEqual([
      'Inscription obligatoire',
      'Gratuit',
    ]);
    expect(repo.save.mock.calls[0][0].actions).toEqual([
      'Préparer un passeport valide',
      'Remplir le formulaire',
    ]);
  });

  it('checkHealth aggregates provider health + labels', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn(), health: jest.fn(async () => false) };
    const verifier = { verify: jest.fn() };
    const ranker = { pickBest: jest.fn(), health: jest.fn(async () => true) };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
    );
    const res = await svc.checkHealth();
    expect(res.llm.ok).toBe(true);
    expect(res.search.ok).toBe(false);
    expect(res.search.provider).toBe('searxng');
    expect(typeof res.llm.model).toBe('string');
  });

  // FIX 2: upsert updates existing row (id: 7) rather than creating a duplicate
  it('upsert updates existing row', async () => {
    const existingRow = { id: 7, countryCode: 'FR', category: 'visa' };
    const repo = makeRepo();
    repo.findOne.mockResolvedValue(existingRow);
    const search = {
      search: jest.fn(async () => [
        candidate('https://france-visas.gouv.fr/x'),
      ]),
    };
    const verifier = {
      verify: jest.fn(async () => ({
        live: true,
        finalUrl: 'https://france-visas.gouv.fr/x',
        matched: true,
      })),
    };
    const ranker = {
      pickBest: jest.fn(async () => ({
        index: 0,
        label: 'France-Visas',
        confidence: 0.9,
      })),
      summarize: jest.fn(async () => []),
    };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
    );
    await svc.generate('FR', 'visa');
    const savedArg = repo.save.mock.calls[0][0];
    expect(savedArg).toMatchObject({ id: 7 });
    expect(repo.create).not.toHaveBeenCalled();
  });
});

// ── Prompt B: hint-driven generation (pinnedUrl short-circuit + fan-out + dedupe) ──────────────
const makeHints = (hint) => ({ findOneOrNull: jest.fn(async () => hint) });

describe('GovLinksService.generate — hint-driven (Prompt B)', () => {
  it('pinnedUrl short-circuit: publishes active, BYPASSES allowlist, SKIPS the ranker', async () => {
    const repo = makeRepo();
    // non-official host on purpose → proves the allowlist is bypassed for a pinned URL
    const search = { search: jest.fn() };
    const verifier = {
      verify: jest.fn(async () => ({
        live: true,
        finalUrl: 'https://example.org/pinned',
        matched: true,
        text: 'page text',
      })),
    };
    const ranker = {
      pickBest: jest.fn(),
      summarize: jest.fn(async () => ({ facts: ['F'], actions: ['A'] })),
    };
    const hints = makeHints({
      pinnedUrl: 'https://example.org/pinned',
      officialDomains: [],
      keywords: '',
      queryLang: 'fr',
      excludeTerms: [],
    });
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
      hints as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('active');
    expect(res.url).toBe('https://example.org/pinned');
    expect(res.label).toBe('épinglé');
    expect(res.confidence).toBe(0.99);
    expect(res.summary).toEqual(['F']);
    expect(res.actions).toEqual(['A']);
    expect(search.search).not.toHaveBeenCalled(); // no search at all on the pinned path
    expect(ranker.pickBest).not.toHaveBeenCalled(); // ranker skipped
    expect(ranker.summarize).toHaveBeenCalledWith('page text', {
      country: 'France',
      category: 'visa',
    });
  });

  it('pinnedUrl that is unreachable → needs_review (a broken pin must not publish)', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn() };
    const verifier = {
      verify: jest.fn(async () => ({
        live: false,
        finalUrl: '',
        matched: false,
        text: '',
      })),
    };
    const ranker = {
      pickBest: jest.fn(),
      summarize: jest.fn(async () => ({ facts: [], actions: [] })),
    };
    const hints = makeHints({
      pinnedUrl: 'https://example.org/dead',
      officialDomains: [],
      keywords: '',
      queryLang: 'fr',
      excludeTerms: [],
    });
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
      hints as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('needs_review');
    expect(res.url).toBe('https://example.org/dead');
    expect(ranker.pickBest).not.toHaveBeenCalled();
  });

  it('fan-out: runs every query from the hint, merges + dedupes candidates by URL before verifying', async () => {
    const repo = makeRepo();
    // hint with one official domain → buildQueries yields 2 queries (1 site: + 1 open)
    const hints = makeHints({
      pinnedUrl: null,
      officialDomains: ['france-visas.gouv.fr'],
      keywords: 'visa',
      queryLang: 'fr',
      excludeTerms: [],
    });
    const search = {
      search: jest
        .fn()
        .mockResolvedValueOnce([candidate('https://france-visas.gouv.fr/a')])
        // 'a/' is the same URL as 'a' (trailing slash) → must be deduped away; 'b' is new
        .mockResolvedValueOnce([
          candidate('https://france-visas.gouv.fr/a/'),
          candidate('https://france-visas.gouv.fr/b'),
        ]),
    };
    const verifier = {
      verify: jest.fn(async (url) => ({
        live: true,
        finalUrl: url,
        matched: true,
        text: 't',
      })),
    };
    const ranker = {
      pickBest: jest.fn(async () => ({
        index: 0,
        label: 'L',
        confidence: 0.9,
      })),
      summarize: jest.fn(async () => ({ facts: [], actions: [] })),
    };
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
      hints as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(search.search).toHaveBeenCalledTimes(2); // both queries run
    expect(verifier.verify).toHaveBeenCalledTimes(2); // a + b only — a/ was deduped
    expect(res.status).toBe('pending_review');
  });

  it('post-verify dedupe: distinct candidates that redirect to the same finalUrl collapse to one', async () => {
    const repo = makeRepo();
    const search = {
      search: jest.fn(async () => [
        candidate('https://a.gov/x'),
        candidate('https://b.gov/y'),
      ]),
    };
    // both candidates redirect to the SAME official finalUrl
    const verifier = {
      verify: jest.fn(async () => ({
        live: true,
        finalUrl: 'https://c.gov/final',
        matched: true,
        text: 't',
      })),
    };
    // declare (query, candidates) so the call tuple exposes index [1] to ts-jest
    const ranker = {
      pickBest: jest.fn(async (_q, candidates) => ({
        index: 0,
        label: 'L',
        confidence: 0.9,
        _seen: candidates.length,
      })),
      summarize: jest.fn(async () => ({ facts: [], actions: [] })),
    };
    const hints = makeHints(null); // fallback (no fiche) → single generic query
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
      hints as never,
    );
    await svc.generate('US', 'visa');
    expect(ranker.pickBest.mock.calls[0][1]).toHaveLength(1); // ranker sees ONE candidate, not two
  });

  it('caps live verification at MAX_VERIFIED (12): 15 official candidates → only 12 fetched', async () => {
    const repo = makeRepo();
    const many = Array.from({ length: 15 }, (_, i) =>
      candidate(`https://service-public.fr/p${i}`),
    );
    const search = { search: jest.fn(async () => many) };
    const verifier = {
      verify: jest.fn(async (url) => ({
        live: true,
        finalUrl: url,
        matched: true,
        text: 't',
      })),
    };
    const ranker = {
      pickBest: jest.fn(async () => ({
        index: 0,
        label: 'L',
        confidence: 0.9,
      })),
      summarize: jest.fn(async () => ({ facts: [], actions: [] })),
    };
    const hints = makeHints(null);
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
      hints as never,
    );
    await svc.generate('FR', 'visa');
    expect(verifier.verify).toHaveBeenCalledTimes(12); // capped BEFORE the live fetches, not after
  });

  it('no fiche (hints returns null) → behaves like the legacy single-query path', async () => {
    const repo = makeRepo();
    const search = {
      search: jest.fn(async () => [
        candidate('https://france-visas.gouv.fr/x'),
      ]),
    };
    const verifier = {
      verify: jest.fn(async () => ({
        live: true,
        finalUrl: 'https://france-visas.gouv.fr/x',
        matched: true,
        text: 't',
      })),
    };
    const ranker = {
      pickBest: jest.fn(async () => ({
        index: 0,
        label: 'France-Visas',
        confidence: 0.9,
      })),
      summarize: jest.fn(async () => ({ facts: [], actions: [] })),
    };
    const hints = makeHints(null);
    const svc = new GovLinksService(
      repo as never,
      search as never,
      verifier as never,
      ranker as never,
      hints as never,
    );
    const res = await svc.generate('FR', 'visa');
    expect(search.search).toHaveBeenCalledTimes(1); // one generic query
    expect(res.status).toBe('pending_review');
    expect(res.url).toBe('https://france-visas.gouv.fr/x');
  });
});
