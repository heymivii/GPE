import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ratingKeys, useMyTopicRatings, useRateMessage, useUnrateMessage } from './useRatings';

vi.mock('../api/ratings', () => ({
  ratingsApi: {
    rate: vi.fn(),
    unrate: vi.fn(),
    myTopicRatings: vi.fn(),
    userRating: vi.fn(),
  },
}));

import { ratingsApi } from '../api/ratings';
const mocked = vi.mocked(ratingsApi);

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('ratingKeys', () => {
  it('builds the topic key', () => {
    expect(ratingKeys.myTopic(3)).toEqual(['ratings', 'my-topic', 3]);
  });
});

describe('useMyTopicRatings', () => {
  it('fetches when enabled', async () => {
    mocked.myTopicRatings.mockResolvedValue([{ messageId: 6, stars: 4 }]);
    const { result } = renderHook(() => useMyTopicRatings(3, true), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ messageId: 6, stars: 4 }]);
  });

  it('does not fetch when disabled', () => {
    mocked.myTopicRatings.mockClear();
    const { result } = renderHook(() => useMyTopicRatings(3, false), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mocked.myTopicRatings).not.toHaveBeenCalled();
  });
});

describe('useRateMessage', () => {
  it('rates a message via the API', async () => {
    mocked.rate.mockResolvedValue({});
    const { result } = renderHook(() => useRateMessage(3), { wrapper: wrapper() });
    result.current.mutate({ messageId: 6, stars: 5 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.rate).toHaveBeenCalledWith(6, 5);
  });
});

describe('useUnrateMessage', () => {
  it('removes a rating via the API', async () => {
    mocked.unrate.mockResolvedValue(undefined);
    const { result } = renderHook(() => useUnrateMessage(3), { wrapper: wrapper() });
    result.current.mutate(6);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.unrate).toHaveBeenCalledWith(6);
  });
});
