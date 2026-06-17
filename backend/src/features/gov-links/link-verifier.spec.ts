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
