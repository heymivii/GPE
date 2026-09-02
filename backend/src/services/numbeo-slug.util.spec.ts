import { numbeoCitySlug } from './numbeo-slug.util';

describe('numbeoCitySlug', () => {
  it('replaces spaces with hyphens', () => {
    expect(numbeoCitySlug('New York')).toBe('New-York');
  });

  it('strips accents', () => {
    expect(numbeoCitySlug('Zürich')).toBe('Zurich');
  });

  it('trims surrounding whitespace', () => {
    expect(numbeoCitySlug('  Paris  ')).toBe('Paris');
  });

  it('collapses multiple internal spaces into a single hyphen', () => {
    expect(numbeoCitySlug('San   Francisco')).toBe('San-Francisco');
  });

  it('leaves a single-word city name unchanged', () => {
    expect(numbeoCitySlug('Tokyo')).toBe('Tokyo');
  });
});
