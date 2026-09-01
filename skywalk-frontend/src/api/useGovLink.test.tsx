import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { toGovCategory, useGovLink } from './useGovLink';

vi.mock('./govLinks', () => ({
  govLinksApi: { list: vi.fn() },
}));

import { govLinksApi } from './govLinks';
const mocked = vi.mocked(govLinksApi);

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('toGovCategory', () => {
  it('maps known aliases to their canonical category', () => {
    expect(toGovCategory('visa')).toBe('visa');
    expect(toGovCategory('demarches-admin')).toBe('demarches');
    expect(toGovCategory('administrative')).toBe('demarches');
    expect(toGovCategory('housing')).toBe('logement');
    expect(toGovCategory('health')).toBe('sante');
  });

  it('is case-insensitive', () => {
    expect(toGovCategory('VISA')).toBe('visa');
  });

  it('returns null for an unknown key', () => {
    expect(toGovCategory('unknown')).toBeNull();
  });

  it('returns null when no key is given', () => {
    expect(toGovCategory(undefined)).toBeNull();
  });
});

describe('useGovLink', () => {
  it('fetches the active link when country and category are known', async () => {
    mocked.list.mockResolvedValue([{ id: 1 } as any]);
    const { result } = renderHook(() => useGovLink('FR', 'visa'), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.link).toEqual({ id: 1 }));
    expect(mocked.list).toHaveBeenCalledWith({
      country: 'FR',
      category: 'visa',
      status: 'active',
    });
  });

  it('does not fetch when the category is unmapped', () => {
    mocked.list.mockClear();
    const { result } = renderHook(() => useGovLink('FR', 'unknown-category'), {
      wrapper: wrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(mocked.list).not.toHaveBeenCalled();
  });

  it('does not fetch when the country is missing', () => {
    mocked.list.mockClear();
    const { result } = renderHook(() => useGovLink(undefined, 'visa'), {
      wrapper: wrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(mocked.list).not.toHaveBeenCalled();
  });

  it('returns undefined link when the query yields no results', async () => {
    mocked.list.mockResolvedValue([]);
    const { result } = renderHook(() => useGovLink('FR', 'visa'), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.link).toBeUndefined();
  });
});
