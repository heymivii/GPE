import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useExchangeRates } from './useExchangeRates';

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useExchangeRates', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns the parsed rates on a successful fetch', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'success', base_code: 'USD', rates: { EUR: 0.86 } }),
    });

    const { result } = renderHook(() => useExchangeRates(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.rates).toEqual({ EUR: 0.86 }));
    expect(fetch).toHaveBeenCalledWith('https://open.er-api.com/v6/latest/USD');
  });

  it('surfaces an error when the HTTP response is not ok', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });

    const { result } = renderHook(() => useExchangeRates(), { wrapper: wrapper() });

    // The hook's own `retry: 1` overrides the wrapper default, so the error surfaces
    // only after one retry + its backoff delay — give waitFor more than the default 1s.
    await waitFor(() => expect(result.current.error).toBeTruthy(), { timeout: 5000 });
    expect(result.current.rates).toBeUndefined();
  });

  it('surfaces an error when the response body is malformed', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'error' }),
    });

    const { result } = renderHook(() => useExchangeRates(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.error).toBeTruthy(), { timeout: 5000 });
  });
});
