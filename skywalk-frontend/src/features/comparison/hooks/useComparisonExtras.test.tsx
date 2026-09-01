import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../../../api/propertyInvestment', () => ({
  propertyInvestmentApi: { get: vi.fn() },
}));
vi.mock('../../../api/qualityOfLife', () => ({
  qualityOfLifeApi: { get: vi.fn() },
}));

import { propertyInvestmentApi } from '../../../api/propertyInvestment';
import { qualityOfLifeApi } from '../../../api/qualityOfLife';
import { useComparisonExtras } from './useComparisonExtras';
import type { EnrichedCountry } from './useCountriesWithData';

const mockedProperty = vi.mocked(propertyInvestmentApi.get);
const mockedQol = vi.mocked(qualityOfLifeApi.get);

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const france: EnrichedCountry = {
  idCountry: 1,
  countryName: 'France',
  isoCode: 'FR',
  uniqueId: 'country-1',
  isCity: false,
} as any;

const paris: EnrichedCountry = {
  idCountry: 1,
  countryName: 'Paris',
  isoCode: 'FR',
  uniqueId: 'city-paris',
  isCity: true,
} as any;

const noIso: EnrichedCountry = {
  idCountry: 2,
  countryName: 'Nowhere',
  uniqueId: 'country-2',
  isCity: false,
} as any;

describe('useComparisonExtras', () => {
  beforeEach(() => {
    mockedProperty.mockReset();
    mockedQol.mockReset();
  });

  it('leaves cities and iso-less countries untouched (no data attached)', () => {
    const { result } = renderHook(() => useComparisonExtras([paris, noIso]), {
      wrapper: wrapper(),
    });
    expect(result.current[0]).toBe(paris);
    expect(result.current[1]).toBe(noIso);
    expect(mockedProperty).not.toHaveBeenCalled();
    expect(mockedQol).not.toHaveBeenCalled();
  });

  it('fetches property investment + quality of life for an eligible country', async () => {
    mockedProperty.mockResolvedValue({ country: 'FR' } as any);
    mockedQol.mockResolvedValue({ country: 'FR' } as any);

    const { result } = renderHook(() => useComparisonExtras([france]), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current[0].propertyInvestment).toEqual({ country: 'FR' }));
    expect(result.current[0].qualityOfLife).toEqual({ country: 'FR' });
    expect(mockedProperty).toHaveBeenCalledWith('FR');
    expect(mockedQol).toHaveBeenCalledWith('FR');
  });

  it('defaults to null while the queries are still pending', () => {
    mockedProperty.mockReturnValue(new Promise(() => {}));
    mockedQol.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useComparisonExtras([france]), {
      wrapper: wrapper(),
    });

    expect(result.current[0].propertyInvestment).toBeNull();
    expect(result.current[0].qualityOfLife).toBeNull();
  });

  it('handles a mixed selection, only enriching the eligible country', async () => {
    mockedProperty.mockResolvedValue({ country: 'FR' } as any);
    mockedQol.mockResolvedValue({ country: 'FR' } as any);

    const { result } = renderHook(() => useComparisonExtras([france, paris]), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current[0].propertyInvestment).toBeTruthy());
    expect(result.current[1]).toBe(paris);
  });
});
