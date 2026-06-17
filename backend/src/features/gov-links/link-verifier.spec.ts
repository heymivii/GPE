import { LinkVerifier, extractText } from './link-verifier';

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

  // FIX 3: keyword in <script> only must NOT match
  it('keyword inside <script> block does NOT match', async () => {
    const html = '<html><head></head><body><p>Bienvenue</p><script>var visa = "visa";</script></body></html>';
    const v = new LinkVerifier(async () => ({ ok: true, finalUrl: 'https://x.gouv.fr/p', text: html }));
    const r = await v.verify('https://x.gouv.fr/p', ['visa']);
    expect(r.live).toBe(true);
    expect(r.matched).toBe(false);
  });

  // FIX 3: keyword in visible body text DOES match
  it('keyword in visible body text DOES match', async () => {
    const html = '<html><body><h1>Demande de visa</h1><script>var x = 0;</script></body></html>';
    const v = new LinkVerifier(async () => ({ ok: true, finalUrl: 'https://x.gouv.fr/visa', text: html }));
    const r = await v.verify('https://x.gouv.fr/visa', ['visa']);
    expect(r.live).toBe(true);
    expect(r.matched).toBe(true);
  });
});

describe('extractText', () => {
  it('strips script tags and their content', () => {
    const html = '<p>hello</p><script>var visa="visa";</script>';
    expect(extractText(html)).not.toContain('visa');
    expect(extractText(html)).toContain('hello');
  });

  it('strips style tags and their content', () => {
    const html = '<p>world</p><style>.visa { color: red; }</style>';
    expect(extractText(html)).not.toContain('visa');
    expect(extractText(html)).toContain('world');
  });

  it('strips HTML tags, leaving text content', () => {
    const html = '<h1>Title</h1><p>Body text</p>';
    const result = extractText(html);
    expect(result).toContain('title');
    expect(result).toContain('body text');
  });
});
