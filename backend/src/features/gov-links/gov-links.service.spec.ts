import { GovLinksService } from './gov-links.service';

const candidate = (url: string) => ({ url, title: 't', snippet: 's' });
function makeRepo() { return { findOne: jest.fn(), find: jest.fn(async () => [{ id: 1 }]), create: jest.fn((x) => ({ ...x })), save: jest.fn(async (e) => ({ ...e, id: 1 })) }; }

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

  // FIX 1: redirect to non-official domain → needs_review
  it('redirect-to-non-official → needs_review', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn(async () => [candidate('https://france-visas.gouv.fr/x')]) };
    // verifier returns finalUrl pointing to a non-official host
    const verifier = { verify: jest.fn(async () => ({ live: true, finalUrl: 'https://evil.com/x', matched: true })) };
    const ranker = { pickBest: jest.fn() };
    const svc = new GovLinksService(repo as never, search as never, verifier as never, ranker as never);
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('needs_review');
    expect(ranker.pickBest).not.toHaveBeenCalled();
  });

  // FIX 4: Ollama fallback (pickBest returns null) → active top link
  it('Ollama fallback (pickBest=null) → active top link', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn(async () => [candidate('https://france-visas.gouv.fr/x')]) };
    const verifier = { verify: jest.fn(async () => ({ live: true, finalUrl: 'https://france-visas.gouv.fr/x', matched: true })) };
    const ranker = { pickBest: jest.fn(async () => null) };
    const svc = new GovLinksService(repo as never, search as never, verifier as never, ranker as never);
    const res = await svc.generate('FR', 'visa');
    expect(res.status).toBe('active');
    expect(res.url).toBe('https://france-visas.gouv.fr/x');
    expect(repo.save).toHaveBeenCalled();
  });

  it('list({ countryCode: "fr", status: "active" }) calls repo.find with uppercased country and returns result', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn() };
    const verifier = { verify: jest.fn() };
    const ranker = { pickBest: jest.fn() };
    const svc = new GovLinksService(repo as never, search as never, verifier as never, ranker as never);
    const result = await svc.list({ countryCode: 'fr', status: 'active' });
    expect(repo.find).toHaveBeenCalledWith({ where: { countryCode: 'FR', status: 'active' }, order: { countryCode: 'ASC', category: 'ASC' } });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('checkHealth aggregates provider health + labels', async () => {
    const repo = makeRepo();
    const search = { search: jest.fn(), health: jest.fn(async () => false) };
    const verifier = { verify: jest.fn() };
    const ranker = { pickBest: jest.fn(), health: jest.fn(async () => true) };
    const svc = new GovLinksService(repo as never, search as never, verifier as never, ranker as never);
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
    const search = { search: jest.fn(async () => [candidate('https://france-visas.gouv.fr/x')]) };
    const verifier = { verify: jest.fn(async () => ({ live: true, finalUrl: 'https://france-visas.gouv.fr/x', matched: true })) };
    const ranker = { pickBest: jest.fn(async () => ({ index: 0, label: 'France-Visas', confidence: 0.9 })) };
    const svc = new GovLinksService(repo as never, search as never, verifier as never, ranker as never);
    await svc.generate('FR', 'visa');
    const savedArg = repo.save.mock.calls[0][0];
    expect(savedArg).toMatchObject({ id: 7 });
    expect(repo.create).not.toHaveBeenCalled();
  });
});
