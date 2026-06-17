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
