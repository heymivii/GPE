import { buildQuery, buildQueries, LANG_BY_COUNTRY } from './query-builder';

describe('LANG_BY_COUNTRY', () => {
  it('maps FR to french', () => {
    expect(LANG_BY_COUNTRY['FR']).toBe('fr');
  });

  it('maps CH to french', () => {
    expect(LANG_BY_COUNTRY['CH']).toBe('fr');
  });

  it('has no entry for US (defaults to english in buildQuery)', () => {
    expect(LANG_BY_COUNTRY['US']).toBeUndefined();
  });

  it('has no entry for JP (defaults to english in buildQuery)', () => {
    expect(LANG_BY_COUNTRY['JP']).toBeUndefined();
  });
});

describe('buildQuery', () => {
  // ── FR / French-language paths ──────────────────────────────────────────────

  it('builds a French visa query for FR', () => {
    const { query, keywords } = buildQuery('France', 'visa', 'FR');
    expect(query.toLowerCase()).toContain('france');
    expect(query).toContain('visa');
    expect(query).toContain('long séjour');
    expect(keywords).toContain('visa');
    expect(keywords.some((k) => k.includes('séjour'))).toBe(true);
  });

  it('builds a French sante query with sécurité sociale intent for FR', () => {
    const { query, keywords } = buildQuery('France', 'sante', 'FR');
    expect(query).toContain('assurance maladie');
    expect(query).toContain('sécurité sociale');
    expect(
      keywords.some((k) => k.includes('maladie') || k.includes('sociale')),
    ).toBe(true);
  });

  it('builds a French demarches query with titre de séjour for CH', () => {
    const { query, keywords } = buildQuery('Suisse', 'demarches', 'CH');
    expect(query).toContain('titre de séjour');
    expect(keywords.some((k) => k.includes('séjour'))).toBe(true);
  });

  it('uses French terms for emploi when countryCode=FR', () => {
    const { query } = buildQuery('France', 'emploi', 'FR');
    expect(query).toContain('permis de travail');
  });

  it('uses French terms for banque when countryCode=FR', () => {
    const { query } = buildQuery('France', 'banque', 'FR');
    expect(query).toContain('ouvrir un compte bancaire');
  });

  it('uses French terms for logement when countryCode=FR', () => {
    const { query } = buildQuery('France', 'logement', 'FR');
    expect(query).toContain('louer logement');
  });

  it('uses French terms for transport when countryCode=FR', () => {
    const { query } = buildQuery('France', 'transport', 'FR');
    expect(query).toContain('permis de conduire');
  });

  it('uses French terms for education when countryCode=FR', () => {
    const { query } = buildQuery('France', 'education', 'FR');
    expect(query).toContain('étudiant étranger');
  });

  // ── EN / English-language paths ─────────────────────────────────────────────

  it('builds an English visa query for US', () => {
    const { query, keywords } = buildQuery('United States', 'visa', 'US');
    expect(query.toLowerCase()).toContain('united states');
    expect(query.toLowerCase()).toContain('visa');
    expect(query).not.toContain('séjour');
    expect(keywords).toContain('visa');
  });

  it('builds an English sante query for JP', () => {
    const { query } = buildQuery('Japan', 'sante', 'JP');
    expect(query).toContain('health insurance');
    expect(query).not.toContain('maladie');
  });

  // ── Backward-compat: no countryCode → defaults to English ───────────────────

  it('defaults to English when countryCode is omitted', () => {
    const { query } = buildQuery('Japan', 'visa');
    expect(query.toLowerCase()).toContain('japan');
    expect(query.toLowerCase()).toContain('visa');
    expect(query).not.toContain('séjour');
  });

  // ── Language-aware trailing qualifier ────────────────────────────────────────

  it('appends "site officiel" for French-language queries (FR)', () => {
    const { query } = buildQuery('France', 'visa', 'FR');
    expect(query).toContain('site officiel');
    expect(query).not.toContain('official government site');
  });

  it('appends "official government site" for English-language queries (US)', () => {
    const { query } = buildQuery('United States', 'visa', 'US');
    expect(query).toContain('official government site');
    expect(query).not.toContain('site officiel');
  });

  it('appends "official government site" for English-language queries (JP)', () => {
    const { query } = buildQuery('Japan', 'sante', 'JP');
    expect(query).toContain('official government site');
    expect(query).not.toContain('site officiel');
  });

  it('appends "official government site" when countryCode is omitted (defaults EN)', () => {
    const { query } = buildQuery('Japan', 'visa');
    expect(query).toContain('official government site');
    expect(query).not.toContain('site officiel');
  });

  // ── culture category ─────────────────────────────────────────────────────────

  it('builds a French culture query with cultural keywords for FR', () => {
    const { query, keywords } = buildQuery('France', 'culture', 'FR');
    expect(query).toContain('vie culturelle');
    expect(query).toContain('site officiel');
    expect(keywords).toContain('culture');
    expect(keywords).toContain('associations');
  });

  it('builds an English culture query for US', () => {
    const { query, keywords } = buildQuery('United States', 'culture', 'US');
    expect(query).toContain('cultural life');
    expect(query).toContain('official government site');
    expect(query).not.toContain('site officiel');
    expect(keywords).toContain('culture');
    expect(keywords).toContain('community');
  });

  // ── business category ────────────────────────────────────────────────────────

  it('builds a French business query with enterprise keywords for FR', () => {
    const { query, keywords } = buildQuery('France', 'business', 'FR');
    expect(query).toContain('entreprise');
    expect(query).toContain('site officiel');
    expect(keywords).toContain('entreprise');
    expect(keywords).toContain('indépendant');
  });

  it('builds an English business query for US', () => {
    const { query, keywords } = buildQuery('United States', 'business', 'US');
    expect(query).toContain('start a business');
    expect(query).toContain('official government site');
    expect(query).not.toContain('site officiel');
    expect(keywords).toContain('business');
    expect(keywords).toContain('self-employed');
  });

  // ── Unknown category fallback ────────────────────────────────────────────────

  it('falls back gracefully for an unknown category (FR)', () => {
    const { query, keywords } = buildQuery('France', 'unknown-cat', 'FR');
    expect(query.toLowerCase()).toContain('france');
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords).toHaveLength(0);
  });

  it('falls back gracefully for an unknown category (no countryCode)', () => {
    const { query, keywords } = buildQuery('Japan', 'unknown-cat');
    expect(query.toLowerCase()).toContain('japan');
    expect(Array.isArray(keywords)).toBe(true);
  });
});

describe('buildQueries (hint-driven fan-out)', () => {
  const frVisaHint = {
    officialDomains: ['france-visas.gouv.fr'],
    keywords: 'visa long séjour VLS-TS demande',
    queryLang: 'fr',
    excludeTerms: ['expatriation des français', 'quitter la france'],
  };

  it('FR/visa: one site: query per domain + an open "site officiel" query, with -excludeTerms', () => {
    const { queries, keywords, excludeTerms } = buildQueries(frVisaHint, {
      countryName: 'France',
      category: 'visa',
      countryCode: 'FR',
    });
    expect(queries).toHaveLength(2); // 1 official domain + 1 open fallback
    expect(queries[0]).toContain('site:france-visas.gouv.fr');
    expect(queries[0]).toContain('visa long séjour VLS-TS demande');
    expect(queries[1]).toContain('site officiel'); // open query, FR qualifier
    for (const q of queries) {
      expect(q).toContain('-"expatriation des français"');
      expect(q).toContain('-"quitter la france"');
    }
    expect(excludeTerms).toEqual(frVisaHint.excludeTerms);
    expect(keywords).toContain('visa');
    expect(keywords).toContain('VLS-TS');
    expect(keywords.every((k) => k.length > 2)).toBe(true);
  });

  it('quotes multi-word exclude terms and leaves single words bare', () => {
    const { queries } = buildQueries(
      {
        officialDomains: ['x.gov'],
        keywords: 'foo',
        queryLang: 'en',
        excludeTerms: ['statistics', 'leaving the country'],
      },
      { countryName: 'X', category: 'visa', countryCode: 'US' },
    );
    expect(queries[0]).toContain('-statistics');
    expect(queries[0]).toContain('-"leaving the country"');
    expect(queries[queries.length - 1]).toContain('official government site');
  });

  it('JP hint: site: query in the hint keywords + the ja "公式サイト" open qualifier', () => {
    const { queries, keywords } = buildQueries(
      {
        officialDomains: ['mofa.go.jp'],
        keywords: 'ビザ 在留資格 申請',
        queryLang: 'ja',
        excludeTerms: [],
      },
      { countryName: 'Japan', category: 'visa', countryCode: 'JP' },
    );
    expect(queries[0]).toContain('site:mofa.go.jp');
    expect(queries[0]).toContain('ビザ 在留資格 申請');
    expect(queries[queries.length - 1]).toContain('公式サイト');
    // CJK-aware relevance tokens: 2-char Japanese words must NOT be dropped by the length filter.
    expect(keywords).toEqual(['ビザ', '在留資格', '申請']);
  });

  it('multiple official domains → one site: query each + the open query', () => {
    const { queries } = buildQueries(
      {
        officialDomains: ['a.gouv.fr', 'b.gouv.fr'],
        keywords: 'k',
        queryLang: 'fr',
        excludeTerms: [],
      },
      { countryName: 'France', category: 'demarches', countryCode: 'FR' },
    );
    expect(queries).toHaveLength(3); // 2 domains + 1 open
    expect(queries[0]).toContain('site:a.gouv.fr');
    expect(queries[1]).toContain('site:b.gouv.fr');
  });

  it('no hint → falls back to the generic single query (buildQuery), unchanged', () => {
    const { queries, keywords } = buildQueries(null, {
      countryName: 'France',
      category: 'visa',
      countryCode: 'FR',
    });
    const generic = buildQuery('France', 'visa', 'FR');
    expect(queries).toHaveLength(1);
    expect(queries[0]).toBe(generic.query);
    expect(keywords).toEqual(generic.keywords);
  });

  it('empty-keywords hint → also falls back to generic', () => {
    const { queries } = buildQueries(
      {
        officialDomains: ['x.gov'],
        keywords: '   ',
        queryLang: 'en',
        excludeTerms: [],
      },
      { countryName: 'Japan', category: 'visa', countryCode: 'JP' },
    );
    expect(queries).toHaveLength(1);
    expect(queries[0]).toBe(buildQuery('Japan', 'visa', 'JP').query);
  });
});
