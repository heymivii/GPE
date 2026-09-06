import { describe, it, expect } from 'vitest';
import { ISO_NUMERIC_TO_ALPHA2 } from '../../../data/isoNumericToAlpha2';

/**
 * Le fond de carte ne fournit que des noms anglais et un code numérique ;
 * Intl.DisplayNames ne comprend que l'alpha-2. Cette table fait le pont.
 */
describe('ISO_NUMERIC_TO_ALPHA2', () => {
  it('couvre les destinations de SkyWalk', () => {
    expect(ISO_NUMERIC_TO_ALPHA2['250']).toBe('FR');
    expect(ISO_NUMERIC_TO_ALPHA2['840']).toBe('US');
    expect(ISO_NUMERIC_TO_ALPHA2['392']).toBe('JP');
    expect(ISO_NUMERIC_TO_ALPHA2['756']).toBe('CH');
  });

  it('couvre la quasi-totalité du fond de carte', () => {
    expect(Object.keys(ISO_NUMERIC_TO_ALPHA2).length).toBeGreaterThan(170);
  });

  it('permet à Intl de traduire les noms de pays', () => {
    const fr = new Intl.DisplayNames(['fr'], { type: 'region' });
    expect(fr.of(ISO_NUMERIC_TO_ALPHA2['076'])).toBe('Brésil');
    expect(fr.of(ISO_NUMERIC_TO_ALPHA2['276'])).toBe('Allemagne');
  });

  it('ne contient que des codes alpha-2 valides', () => {
    for (const [num, alpha] of Object.entries(ISO_NUMERIC_TO_ALPHA2)) {
      expect(num).toMatch(/^\d{3}$/);
      expect(alpha).toMatch(/^[A-Z]{2}$/);
    }
  });
});
