import { describe, it, expect } from 'vitest';
import {
  parseSmartQuery,
  isAdzunaSupported,
  getCountryCodeFromName,
} from './smartQueryParser';

describe('parseSmartQuery', () => {
  it('returns all-empty fields for a blank query', () => {
    expect(parseSmartQuery('')).toEqual({
      keyword: '',
      city: '',
      countryCode: '',
      countryName: '',
    });
    expect(parseSmartQuery('   ')).toEqual({
      keyword: '',
      city: '',
      countryCode: '',
      countryName: '',
    });
  });

  it('treats the whole query as the keyword when no city/country is recognized', () => {
    const result = parseSmartQuery('développeur senior');
    expect(result).toEqual({
      keyword: 'développeur senior',
      city: '',
      countryCode: '',
      countryName: '',
    });
  });

  it('detects a single-word city and infers its country', () => {
    const result = parseSmartQuery('developpeur paris');
    expect(result.city).toBe('Paris');
    expect(result.countryCode).toBe('fr');
    expect(result.countryName).toBe('France');
    expect(result.keyword).toBe('developpeur');
  });

  it('detects a single-word country alias', () => {
    const result = parseSmartQuery('developpeur france');
    expect(result.countryCode).toBe('fr');
    expect(result.countryName).toBe('France');
    expect(result.city).toBe('');
    expect(result.keyword).toBe('developpeur');
  });

  it('detects a multi-word city phrase and capitalizes it', () => {
    const result = parseSmartQuery('ingenieur new york');
    expect(result.city).toBe('New York');
    expect(result.countryCode).toBe('us');
    expect(result.keyword).toBe('ingenieur');
  });

  it('detects a multi-word country phrase', () => {
    const result = parseSmartQuery('stage etats-unis');
    expect(result.countryCode).toBe('us');
    expect(result.countryName).toBe('États-Unis');
    expect(result.keyword).toBe('stage');
  });

  it('keeps a redundant country word in the keyword once the city already set the country', () => {
    // "france" here is a real quirk of the word-by-word pass: once `paris` has already
    // resolved city+country, the countryAliases branch for "france" is skipped (country
    // already set), and the city branch is skipped too (city already set) — so it falls
    // through to the keyword.
    const result = parseSmartQuery('developpeur paris france');
    expect(result.city).toBe('Paris');
    expect(result.countryCode).toBe('fr');
    expect(result.keyword).toBe('developpeur france');
  });

  it('falls back to the currentCountryFilter when nothing was detected in the query', () => {
    const result = parseSmartQuery('développeur', 'switzerland');
    expect(result.countryCode).toBe('ch');
    expect(result.countryName).toBe('Suisse');
  });

  it('ignores the currentCountryFilter once the query already carries a country', () => {
    const result = parseSmartQuery('développeur france', 'switzerland');
    expect(result.countryCode).toBe('fr');
  });
});

describe('isAdzunaSupported', () => {
  it('returns true for a supported country code, case-insensitively', () => {
    expect(isAdzunaSupported('fr')).toBe(true);
    expect(isAdzunaSupported('FR')).toBe(true);
  });

  it('returns false for a country not covered by Adzuna (e.g. Japan)', () => {
    expect(isAdzunaSupported('jp')).toBe(false);
  });
});

describe('getCountryCodeFromName', () => {
  it('resolves a known country display name to its code', () => {
    expect(getCountryCodeFromName('Suisse')).toBe('ch');
  });

  it('accepts a raw ISO2 code when it is Adzuna-supported', () => {
    expect(getCountryCodeFromName('ch')).toBe('ch');
  });

  it('returns an empty string for an unsupported raw ISO2 code (e.g. jp)', () => {
    expect(getCountryCodeFromName('jp')).toBe('');
  });

  it('returns an empty string for an unrecognized name', () => {
    expect(getCountryCodeFromName('Atlantide')).toBe('');
  });
});
