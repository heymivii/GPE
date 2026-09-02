import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../../../api/country', () => ({ countryApi: { getAll: vi.fn() } }));
vi.mock('../../../api/destinations', () => ({ destinationsApi: { getBySlug: vi.fn() } }));
vi.mock('../../../data/supportedCountries', () => ({
  SUPPORTED_COUNTRY_CODES: ['FR', 'ZZ'],
}));
vi.mock('../../../data/countries-data.json', () => ({
  default: {
    countries: [
      {
        id: 1,
        code: 'FR',
        name: 'France',
        currency: 'EUR',
        languages: ['fr'],
        flagUrl: 'json-flag.png',
        flagEmoji: '🇫🇷',
        continent: 'Europe',
        capital: 'Paris',
        recommendations: { bestFor: ['tech'] },
      },
    ],
  },
}));

import { countryApi } from '../../../api/country';
import { destinationsApi } from '../../../api/destinations';
import { useCountriesWithData } from './useCountriesWithData';

const mockedGetAll = vi.mocked(countryApi.getAll);
const mockedGetBySlug = vi.mocked(destinationsApi.getBySlug);

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const capitalCostOfLiving = {
  categories: {
    housing: {
      rent: {
        oneBedroom: { cityCenter: { avg: 1234.6 } },
        threeBedroom: { cityCenter: { avg: 2000.4 } },
      },
    },
    food: {
      markets: {
        bread500g: { avg: 2 },
        milk1L: { avg: 1 },
        eggs12: { avg: 3 },
        rice1kg: { avg: 2 },
        chicken1kg: { avg: 8 },
        tomato1kg: { avg: 2 },
        potato1kg: { avg: 1 },
        apple1kg: { avg: 2 },
      },
    },
    restaurants: { inexpensiveMeal: { avg: 15.4 } },
    salary: { averageMonthly: { avg: 2500.2 } },
    utilities: { basic85m2: { avg: 150.6 } },
    transportation: { publicTransport: { monthlyPass: { avg: 75.3 } } },
  },
  currency: { code: 'EUR', exchangeRates: { USD: 1.1 } },
  summary: { averageSalary: 2400 },
};

const apiCountries = [
  {
    idCountry: 1,
    countryName: 'France',
    isoCode: 'FR',
    flagUrl: 'api-flag.png',
    capital: 'api-capital',
    continent: { continentName: 'api-continent' },
  },
  { idCountry: 2, countryName: 'NoCode', isoCode: undefined },
  { idCountry: 3, countryName: 'Unsupported', isoCode: 'XX' },
] as any;

describe('useCountriesWithData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('excludes countries without an ISO code and countries outside the supported list', async () => {
    mockedGetAll.mockResolvedValue(apiCountries);
    mockedGetBySlug.mockResolvedValue({ currency: 'EUR', cities: [] } as any);

    const { result } = renderHook(() => useCountriesWithData(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const names = result.current.data.map((c) => c.countryName);
    expect(names).not.toContain('NoCode');
    expect(names).not.toContain('Unsupported');
  });

  it('merges JSON static data with API data, preferring JSON, falling back to API', async () => {
    mockedGetAll.mockResolvedValue(apiCountries);
    mockedGetBySlug.mockResolvedValue({ currency: 'EUR', cities: [] } as any);

    const { result } = renderHook(() => useCountriesWithData(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const fr = result.current.data.find((c) => c.isoCode === 'FR')!;
    expect(fr.flagUrl).toBe('json-flag.png'); // JSON wins over API's 'api-flag.png'
    expect(fr.capital).toBe('Paris'); // from JSON
    expect(fr.continent).toBe('Europe'); // from JSON, not 'api-continent'
    expect(fr.recommendations).toEqual({ bestFor: ['tech'] });
  });

  it('extracts and rounds cost-of-living figures from the capital city cache', async () => {
    mockedGetAll.mockResolvedValue(apiCountries);
    mockedGetBySlug.mockResolvedValue({
      currency: 'EUR',
      cities: [
        { idCity: 10, name: 'Paris', isCapital: true, costOfLiving: capitalCostOfLiving },
      ],
    } as any);

    const { result } = renderHook(() => useCountriesWithData(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const fr = result.current.data.find((c) => c.isoCode === 'FR')!;
    expect(fr.costOfLiving?.averageRent?.oneBedroom).toBe(1235); // rounded
    expect(fr.costOfLiving?.averageSalary).toBe(2500); // salary.averageMonthly wins over summary
    // 2*bread(2) + 3*milk(1) + eggs(3) + rice(2) + chicken(8) + tomato(2) + potato(1) + apple(2) = 4+3+3+2+8+2+1+2 = 25
    expect(fr.costOfLiving?.food?.groceriesWeekly).toBe(25);
  });

  it('adds a city entry only when the city has cost-of-living data, inheriting the parent country fields', async () => {
    mockedGetAll.mockResolvedValue(apiCountries);
    mockedGetBySlug.mockResolvedValue({
      currency: 'EUR',
      cities: [
        { idCity: 10, name: 'Paris', isCapital: true, costOfLiving: capitalCostOfLiving },
        { idCity: 11, name: 'Lyon', isCapital: false, costOfLiving: null },
      ],
    } as any);

    const { result } = renderHook(() => useCountriesWithData(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const cityNames = result.current.data.filter((c) => c.isCity).map((c) => c.countryName);
    expect(cityNames).toEqual(['Paris']); // Lyon has no costOfLiving → excluded

    const parisEntry = result.current.data.find((c) => c.uniqueId === 'city-10')!;
    expect(parisEntry.parentId).toBe(1);
    expect(parisEntry.isoCode).toBe('FR'); // inherited from the parent country
    expect(parisEntry.recommendations).toBeUndefined(); // explicitly cleared for cities
  });

  it('leaves costOfLiving undefined for a city whose cost data has no categories', async () => {
    mockedGetAll.mockResolvedValue(apiCountries);
    mockedGetBySlug.mockResolvedValue({
      currency: 'EUR',
      cities: [{ idCity: 12, name: 'Marseille', isCapital: false, costOfLiving: {} }],
    } as any);

    const { result } = renderHook(() => useCountriesWithData(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const marseille = result.current.data.find((c) => c.uniqueId === 'city-12')!;
    expect(marseille).toBeDefined();
    expect(marseille.costOfLiving).toBeUndefined();
  });

  it('picks a non-capital city with cost-of-living data when no capital is flagged/priced', async () => {
    mockedGetAll.mockResolvedValue(apiCountries);
    mockedGetBySlug.mockResolvedValue({
      currency: 'EUR',
      cities: [
        { idCity: 13, name: 'Regional Capital', isCapital: true, costOfLiving: null },
        { idCity: 14, name: 'Lyon', isCapital: false, costOfLiving: capitalCostOfLiving },
      ],
    } as any);

    const { result } = renderHook(() => useCountriesWithData(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const fr = result.current.data.find((c) => c.isoCode === 'FR' && !c.isCity)!;
    expect(fr.costOfLiving?.averageRent?.oneBedroom).toBe(1235);
  });

  it('falls back to null capital data when a country detail fetch fails', async () => {
    mockedGetAll.mockResolvedValue(apiCountries);
    mockedGetBySlug.mockImplementation((code: string) =>
      code === 'FR'
        ? Promise.reject(new Error('not found'))
        : Promise.resolve({ currency: 'EUR', cities: [] } as any),
    );

    const { result } = renderHook(() => useCountriesWithData(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const fr = result.current.data.find((c) => c.isoCode === 'FR')!;
    expect(fr.costOfLiving).toBeUndefined();
  });
});
