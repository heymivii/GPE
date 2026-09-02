import { countryDisplayName, listSupportedCountries } from './supported-countries';

describe('countryDisplayName', () => {
  it('returns the display name for a known code', () => {
    expect(countryDisplayName('FR')).toBe('France');
  });

  it('is case-insensitive', () => {
    expect(countryDisplayName('fr')).toBe('France');
  });

  it('falls back to the raw code for an unknown country', () => {
    expect(countryDisplayName('ZZ')).toBe('ZZ');
  });
});

describe('listSupportedCountries', () => {
  it('exposes only code/name/flag, without the internal official-domain allowlist', () => {
    const result = listSupportedCountries();
    expect(result).toHaveLength(4);
    expect(result).toContainEqual({ code: 'FR', name: 'France', flag: '🇫🇷' });
    expect(result.every((c) => !('officialSuffixes' in c))).toBe(true);
  });
});
