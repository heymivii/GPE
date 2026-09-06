import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../data/supportedCountries', () => ({
  SUPPORTED_COUNTRIES: [
    {
      code: 'FR',
      name: 'France',
      slug: 'france',
      flag: '🇫🇷',
      iso3: 'FRA',
      i18nKey: 'countries.france',
      apiCity: 'Paris',
      apiCountryName: 'France',
    },
  ],
  ISO2_TO_ISO3: { FR: 'FRA', DE: 'DEU' },
  CITIES_BY_COUNTRY: { France: ['Paris', 'Lyon'] },
}));

vi.mock('../data/countryMappings', () => ({
  flagEmoji: (code: string) => `flag-${code}`,
  slugify: (name: string) => name.toLowerCase().replace(/\s+/g, '-'),
  hydrateCountries: vi.fn(),
}));

vi.mock('../api/country', () => ({ countryApi: { getActive: vi.fn() } }));
vi.mock('../api/city', () => ({ cityApi: { getActive: vi.fn() } }));

import { countryApi } from '../api/country';
import { cityApi } from '../api/city';
import { hydrateCountries } from '../data/countryMappings';
import { useSupportedCountries } from './useSupportedCountries';

const mockedGetActiveCountries = vi.mocked(countryApi.getActive);
const mockedGetActiveCities = vi.mocked(cityApi.getActive);
const mockedHydrate = vi.mocked(hydrateCountries);

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const dbCountries = [
  { idCountry: 1, isoCode: 'FR', countryName: 'France', selectableAsDestination: true },
  { idCountry: 2, isoCode: 'DE', countryName: 'Allemagne', selectableAsDestination: false },
] as any;

const dbCities = [
  { idCity: 10, name: 'Paris', countryId: 1, isCapital: true, country: { countryName: 'France' } },
  { idCity: 11, name: 'Berlin', countryId: 2, isCapital: true, country: { countryName: 'Allemagne' } },
] as any;

describe('useSupportedCountries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the static seed while the queries are loading', () => {
    mockedGetActiveCountries.mockReturnValue(new Promise(() => {}));
    mockedGetActiveCities.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.countries[0].name).toBe('France');
  });

  it('prefers the curated seed entry when the DB country matches by ISO code', async () => {
    mockedGetActiveCountries.mockResolvedValue(dbCountries);
    mockedGetActiveCities.mockResolvedValue(dbCities);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const fr = result.current.countries.find((c) => c.code === 'FR');
    expect(fr).toEqual({
      code: 'FR',
      name: 'France',
      slug: 'france',
      flag: '🇫🇷',
      iso3: 'FRA',
      i18nKey: 'countries.france',
      apiCity: 'Paris',
      apiCountryName: 'France',
    });
  });

  it('derives all fields for a DB country absent from the seed', async () => {
    mockedGetActiveCountries.mockResolvedValue(dbCountries);
    mockedGetActiveCities.mockResolvedValue(dbCities);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const de = result.current.countries.find((c) => c.code === 'DE');
    expect(de).toEqual({
      code: 'DE',
      name: 'Allemagne',
      slug: 'allemagne',
      flag: 'flag-DE',
      iso3: 'DEU',
      isoNumeric: '276', // dérivé de l'alpha-2 : la carte apparie ses tracés par ce code
      i18nKey: 'countries.allemagne',
      apiCity: 'Berlin', // capital city of the active cities for that country
      apiCountryName: 'Allemagne',
    });
  });

  it('groups active cities by country display name, falling back to the static list otherwise', async () => {
    mockedGetActiveCountries.mockResolvedValue(dbCountries);
    mockedGetActiveCities.mockResolvedValue(dbCities);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.citiesByCountry).toEqual({
      France: ['Paris'],
      Allemagne: ['Berlin'],
    });
  });

  it('groups active city records by ISO2 code', async () => {
    mockedGetActiveCountries.mockResolvedValue(dbCountries);
    mockedGetActiveCities.mockResolvedValue(dbCities);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.citiesByCode.FR.map((c) => c.name)).toEqual(['Paris']);
    expect(result.current.citiesByCode.DE.map((c) => c.name)).toEqual(['Berlin']);
  });

  it('marks countries with selectableAsDestination=false as non-selectable', async () => {
    mockedGetActiveCountries.mockResolvedValue(dbCountries);
    mockedGetActiveCities.mockResolvedValue(dbCities);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.nonSelectableCodes.has('DE')).toBe(true);
    expect(result.current.nonSelectableCodes.has('FR')).toBe(false);
  });

  it('falls back to the static seed when the DB has no active countries', async () => {
    mockedGetActiveCountries.mockResolvedValue([]);
    mockedGetActiveCities.mockResolvedValue([]);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.countries[0].name).toBe('France');
  });

  it('skips a DB country with no ISO2 code, and picks the first city (no capital) or the country name (no cities)', async () => {
    const countriesWithEdgeCases = [
      { idCountry: 3, isoCode: null, countryName: 'NoCode' }, // no ISO2 → dropped entirely
      { idCountry: 4, isoCode: 'IT', countryName: 'Italie' }, // active cities, none flagged capital
      { idCountry: 5, isoCode: 'NL', countryName: 'Pays-Bas' }, // no active cities at all
    ] as any;
    const citiesWithEdgeCases = [
      { idCity: 20, name: 'Milan', countryId: 4, isCapital: false, country: { countryName: 'Italie' } },
      { idCity: 21, name: 'Turin', countryId: 4, isCapital: false, country: { countryName: 'Italie' } },
    ] as any;
    mockedGetActiveCountries.mockResolvedValue(countriesWithEdgeCases);
    mockedGetActiveCities.mockResolvedValue(citiesWithEdgeCases);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.countries.find((c) => c.name === 'NoCode')).toBeUndefined();
    expect(result.current.countries.find((c) => c.code === 'IT')?.apiCity).toBe('Milan'); // first city, no capital
    expect(result.current.countries.find((c) => c.code === 'NL')?.apiCity).toBe('Pays-Bas'); // fallback to the country name
  });

  it('skips a city whose country relation is missing, when grouping by display name', async () => {
    const citiesWithMissingCountry = [
      { idCity: 30, name: 'Orphan City', countryId: 1, isCapital: false, country: undefined },
    ] as any;
    mockedGetActiveCountries.mockResolvedValue(dbCountries);
    mockedGetActiveCities.mockResolvedValue(citiesWithMissingCountry);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // The orphan city (no .country relation) is skipped, so France falls back to the
    // static CITIES_BY_COUNTRY seed instead of an empty/partial active-city list.
    expect(result.current.citiesByCountry.France).toEqual(['Paris', 'Lyon']);
  });

  it('skips a city whose countryId matches no known DB country, when grouping by ISO code', async () => {
    const citiesWithUnknownCountryId = [
      { idCity: 40, name: 'Ghost Town', countryId: 999, isCapital: false, country: { countryName: 'Nowhere' } },
    ] as any;
    mockedGetActiveCountries.mockResolvedValue(dbCountries);
    mockedGetActiveCities.mockResolvedValue(citiesWithUnknownCountryId);
    const { result } = renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.citiesByCode.FR).toBeUndefined();
    expect(result.current.citiesByCode.DE).toBeUndefined();
  });

  it('hydrates the synchronous country registry once the merge settles', async () => {
    mockedGetActiveCountries.mockResolvedValue(dbCountries);
    mockedGetActiveCities.mockResolvedValue(dbCities);
    renderHook(() => useSupportedCountries(), { wrapper: wrapper() });

    await waitFor(() => expect(mockedHydrate).toHaveBeenCalled());
    const hydratedList = mockedHydrate.mock.calls.at(-1)![0];
    expect(hydratedList.map((c: any) => c.code)).toEqual(expect.arrayContaining(['FR', 'DE']));
  });
});
