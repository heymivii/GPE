import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../api/experts', () => ({
  expertsApi: { list: vi.fn(), verify: vi.fn(), revoke: vi.fn() },
}));

import { expertsApi } from '../api/experts';
import {
  expertKeys,
  useExperts,
  useVerifyExpert,
  useRevokeExpert,
} from './useExperts';

const mocked = vi.mocked(expertsApi);

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('expertKeys', () => {
  it('builds a stable list key from countryId and q, defaulting both', () => {
    expect(expertKeys.list()).toEqual(['experts', 'list', null, '']);
    expect(expertKeys.list(3, 'lawyer')).toEqual(['experts', 'list', 3, 'lawyer']);
  });
});

describe('useExperts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches experts filtered by countryId and q', async () => {
    mocked.list.mockResolvedValue([{ idUser: 1 } as any]);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useExperts(3, 'lawyer'), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.list).toHaveBeenCalledWith({ countryId: 3, q: 'lawyer' });
    expect(result.current.data).toEqual([{ idUser: 1 }]);
  });
});

describe('useVerifyExpert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies and invalidates the experts + admin-users caches', async () => {
    mocked.verify.mockResolvedValue({} as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useVerifyExpert(), { wrapper: wrapper(qc) });
    result.current.mutate({ userId: 1, dto: { expertTitle: 'Lawyer' } as any });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.verify).toHaveBeenCalledWith(1, { expertTitle: 'Lawyer' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: expertKeys.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-users'] });
  });
});

describe('useRevokeExpert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('revokes and invalidates the experts + admin-users caches', async () => {
    mocked.revoke.mockResolvedValue({} as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useRevokeExpert(), { wrapper: wrapper(qc) });
    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.revoke).toHaveBeenCalledWith(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: expertKeys.all });
  });
});
