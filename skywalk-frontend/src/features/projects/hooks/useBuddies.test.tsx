import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../../../api/buddies', () => ({
  getBuddies: vi.fn(),
}));

import { getBuddies } from '../../../api/buddies';
import { useBuddies } from './useBuddies';

const mockedGetBuddies = vi.mocked(getBuddies);

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useBuddies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches buddies for the given procedure and country', async () => {
    mockedGetBuddies.mockResolvedValue([{ idUser: 1, firstname: 'Jane', originCountry: 'Germany', completedAt: '2026-08-01' }]);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useBuddies(5, 10), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetBuddies).toHaveBeenCalledWith(5, 10);
    expect(result.current.data).toEqual([
      { idUser: 1, firstname: 'Jane', originCountry: 'Germany', completedAt: '2026-08-01' },
    ]);
  });

  it('stays disabled and does not fetch when the procedure id is missing', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useBuddies(undefined, 10), { wrapper: wrapper(qc) });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedGetBuddies).not.toHaveBeenCalled();
  });

  it('stays disabled and does not fetch when the country id is missing', () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useBuddies(5, undefined), { wrapper: wrapper(qc) });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedGetBuddies).not.toHaveBeenCalled();
  });
});
