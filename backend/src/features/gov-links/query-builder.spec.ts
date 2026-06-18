import { buildQuery, LANG_BY_COUNTRY } from './query-builder';

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
    expect(keywords.some((k) => k.includes('maladie') || k.includes('sociale'))).toBe(true);
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
