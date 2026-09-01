import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_COUNTRY_CODES,
  SUPPORTED_COUNTRY_NAMES,
  SUPPORTED_COUNTRY_SLUGS,
  ISO2_TO_ISO3,
  ISO3_TO_ISO2,
  COUNTRY_CITY_MAP,
  getCountryMapping,
  getLocale,
  getCurrentLocale,
} from './supportedCountries';

describe('derived lookup tables', () => {
  it('SUPPORTED_COUNTRY_CODES/NAMES/SLUGS mirror SUPPORTED_COUNTRIES', () => {
    expect(SUPPORTED_COUNTRY_CODES).toEqual(SUPPORTED_COUNTRIES.map((c) => c.code));
    expect(SUPPORTED_COUNTRY_NAMES).toEqual(SUPPORTED_COUNTRIES.map((c) => c.name));
    expect(SUPPORTED_COUNTRY_SLUGS).toEqual(SUPPORTED_COUNTRIES.map((c) => c.slug));
  });

  it('ISO2_TO_ISO3 and ISO3_TO_ISO2 are inverse maps', () => {
    expect(ISO2_TO_ISO3.FR).toBe('FRA');
    expect(ISO3_TO_ISO2.FRA).toBe('FR');
  });

  it('COUNTRY_CITY_MAP is keyed by slug', () => {
    expect(COUNTRY_CITY_MAP.france).toEqual({
      city: 'Paris',
      country: 'France',
      displayName: 'France',
    });
  });
});

describe('getCountryMapping', () => {
  it('returns the mapping for a known slug', () => {
    expect(getCountryMapping('japon')).toEqual({
      city: 'Tokyo',
      country: 'Japan',
      displayName: 'Japon',
    });
  });

  it('defaults to France when the slug is undefined or null', () => {
    expect(getCountryMapping(undefined)).toEqual(COUNTRY_CITY_MAP.france);
    expect(getCountryMapping(null)).toEqual(COUNTRY_CITY_MAP.france);
  });

  it('falls back to France for an unknown slug', () => {
    expect(getCountryMapping('atlantide')).toEqual(COUNTRY_CITY_MAP.france);
  });
});

describe('getLocale', () => {
  it('maps "fr" to fr-FR', () => {
    expect(getLocale('fr')).toBe('fr-FR');
  });

  it('maps anything else to en-US', () => {
    expect(getLocale('en')).toBe('en-US');
    expect(getLocale('de')).toBe('en-US');
  });
});

describe('getCurrentLocale', () => {
  afterEach(() => {
    document.documentElement.lang = '';
    vi.restoreAllMocks();
  });

  it('uses document.documentElement.lang when set', () => {
    document.documentElement.lang = 'fr';
    expect(getCurrentLocale()).toBe('fr-FR');
  });

  it('falls back to navigator.language when the document has no lang', () => {
    document.documentElement.lang = '';
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');
    expect(getCurrentLocale()).toBe('en-US');
  });

  it('falls back to fr-FR when reading the locale throws', () => {
    vi.spyOn(navigator, 'language', 'get').mockImplementation(() => {
      throw new Error('boom');
    });
    expect(getCurrentLocale()).toBe('fr-FR');
  });
});
