import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../api/costOfLiving', () => ({
  costOfLivingApi: { getCostOfLiving: vi.fn() },
}));

vi.mock('../data/supportedCountries', () => ({
  SUPPORTED_COUNTRIES: [{ code: 'FR', name: 'France' }],
}));

import { costOfLivingApi } from '../api/costOfLiving';
import { CostOfLivingProvider, useCostOfLiving } from './CostOfLivingContext';

const mockedGet = vi.mocked(costOfLivingApi.getCostOfLiving);

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <CostOfLivingProvider>{children}</CostOfLivingProvider>
    </QueryClientProvider>
  );
}

describe('CostOfLivingContext', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('does not query until a target is set', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useCostOfLiving(), { wrapper: wrapper(qc) });
    expect(result.current.isLoading).toBe(false);
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('fetches the cost of living once both city and country are set', async () => {
    mockedGet.mockResolvedValue({ city: { name: 'Paris' } } as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useCostOfLiving(), { wrapper: wrapper(qc) });

    act(() => result.current.setTarget('Paris', 'France'));

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(mockedGet).toHaveBeenCalledWith('Paris', 'France');
    expect(result.current.city).toBe('Paris');
    expect(result.current.country).toBe('France');
  });

  it('surfaces an error state when the fetch fails', async () => {
    mockedGet.mockRejectedValue(new Error('not found'));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useCostOfLiving(), { wrapper: wrapper(qc) });

    act(() => result.current.setTarget('Nowhere', 'Nowhere'));

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('clearTarget() resets city and country, disabling the query again', async () => {
    mockedGet.mockResolvedValue({ city: { name: 'Paris' } } as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useCostOfLiving(), { wrapper: wrapper(qc) });

    act(() => result.current.setTarget('Paris', 'France'));
    await waitFor(() => expect(result.current.data).toBeDefined());

    act(() => result.current.clearTarget());
    expect(result.current.city).toBeNull();
    expect(result.current.country).toBeNull();
  });

  it('exposes the static supported countries list', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useCostOfLiving(), { wrapper: wrapper(qc) });
    expect(result.current.supportedCountries).toEqual([{ code: 'FR', name: 'France' }]);
  });

  it('throws when useCostOfLiving is used outside of the provider', () => {
    const { result } = renderHook(() => {
      try {
        return useCostOfLiving();
      } catch (e) {
        return e;
      }
    });
    expect(result.current).toBeInstanceOf(Error);
  });
});
