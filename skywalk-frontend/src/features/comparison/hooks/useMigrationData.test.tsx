import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../../../api/migration', () => ({ migrationApi: { getAll: vi.fn() } }));
vi.mock('../../../data/supportedCountries', () => ({
  ISO2_TO_ISO3: { FR: 'FRA', CH: 'CHE' },
}));

import { migrationApi } from '../../../api/migration';
import { useMigrationData } from './useMigrationData';

const mockedGetAll = vi.mocked(migrationApi.getAll);

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useMigrationData', () => {
  beforeEach(() => {
    mockedGetAll.mockReset();
  });

  it('fetches the full migration dataset', async () => {
    mockedGetAll.mockResolvedValue([{ countryCode: 'FRA', countryName: 'France' }] as any);
    const { result } = renderHook(() => useMigrationData(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.migrationData).toBeDefined());
    expect(result.current.migrationData).toHaveLength(1);
  });

  it('getByIso2 resolves a country via its ISO3 code', async () => {
    mockedGetAll.mockResolvedValue([
      { countryCode: 'FRA', countryName: 'France' },
      { countryCode: 'CHE', countryName: 'Switzerland' },
    ] as any);
    const { result } = renderHook(() => useMigrationData(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.migrationData).toBeDefined());

    expect(result.current.getByIso2('fr')?.countryName).toBe('France');
    expect(result.current.getByIso2('CH')?.countryName).toBe('Switzerland');
  });

  it('getByIso2 returns undefined for an unmapped or missing code', async () => {
    mockedGetAll.mockResolvedValue([{ countryCode: 'FRA', countryName: 'France' }] as any);
    const { result } = renderHook(() => useMigrationData(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.migrationData).toBeDefined());

    expect(result.current.getByIso2('ZZ')).toBeUndefined();
    expect(result.current.getByIso2(undefined)).toBeUndefined();
  });

  it('getByIso2 returns undefined while data has not loaded yet', () => {
    mockedGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useMigrationData(), { wrapper: wrapper() });
    expect(result.current.getByIso2('fr')).toBeUndefined();
  });
});
