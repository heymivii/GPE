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
