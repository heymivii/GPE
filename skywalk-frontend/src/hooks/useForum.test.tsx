import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  forumKeys,
  useForumTopics,
  useForumTopic,
  useForumMessages,
  useFollowedTopics,
  useFollowTopic,
  useUnfollowTopic,
} from './useForum';

// Mock both API modules
vi.mock('../api/forum-topics', () => ({
  forumTopicsApi: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    lockTopic: vi.fn(),
    pinTopic: vi.fn(),
    moderatorRemove: vi.fn(),
    getFollowed: vi.fn(),
    follow: vi.fn(),
    unfollow: vi.fn(),
  },
}));

vi.mock('../api/forum-messages', () => ({
  forumMessagesApi: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    findByTopic: vi.fn(),
    moderatorRemove: vi.fn(),
    report: vi.fn(),
    getReports: vi.fn(),
    getReportStats: vi.fn(),
    resolveReport: vi.fn(),
  },
}));

import { forumTopicsApi } from '../api/forum-topics';
import { forumMessagesApi } from '../api/forum-messages';

const mockedTopicsApi = vi.mocked(forumTopicsApi);
const mockedMessagesApi = vi.mocked(forumMessagesApi);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('forumKeys', () => {
  it('should generate correct query keys', () => {
    expect(forumKeys.all).toEqual(['forum']);
    expect(forumKeys.topics()).toEqual(['forum', 'topics']);
    expect(forumKeys.topic(5)).toEqual(['forum', 'topics', 5]);
    expect(forumKeys.messages()).toEqual(['forum', 'messages']);
    expect(forumKeys.message(3)).toEqual(['forum', 'messages', 3]);
    expect(forumKeys.messagesByTopic(1)).toEqual(['forum', 'messages', 'topic', 1]);
    expect(forumKeys.reports('pending')).toEqual(['forum', 'reports', 'pending']);
    expect(forumKeys.reportStats()).toEqual(['forum', 'report-stats']);
    expect(forumKeys.followed()).toEqual(['forum', 'followed']);
  });
});

describe('useForumTopics', () => {
  it('should fetch topics list', async () => {
    mockedTopicsApi.findAll.mockResolvedValue([
      { topic_id: 1, title: 'Topic 1' } as any,
    ]);

    const { result } = renderHook(() => useForumTopics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].title).toBe('Topic 1');
  });
});

describe('useForumTopic', () => {
  it('should fetch single topic with messages', async () => {
    mockedTopicsApi.findOne.mockResolvedValue({
      topic_id: 5,
      title: 'Test Topic',
      messages: [],
    } as any);

    const { result } = renderHook(() => useForumTopic(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.title).toBe('Test Topic');
  });

  it('should not fetch when id is 0', () => {
    const { result } = renderHook(() => useForumTopic(0), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useForumMessages', () => {
  it('should fetch messages list', async () => {
    mockedMessagesApi.findAll.mockResolvedValue([
      { message_id: 1, content: 'Hello' } as any,
    ]);

    const { result } = renderHook(() => useForumMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

// ─── F2 : suivi de discussions ─────────────────────────────────────

describe('useFollowedTopics', () => {
  it('fetches the followed topics when enabled', async () => {
    mockedTopicsApi.getFollowed.mockResolvedValue([
      { topic_id: 9, title: 'Followed' } as any,
    ]);

    const { result } = renderHook(() => useFollowedTopics(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(mockedTopicsApi.getFollowed).toHaveBeenCalled();
  });

  it('does not fetch when disabled (anonymous)', () => {
    mockedTopicsApi.getFollowed.mockClear();
    const { result } = renderHook(() => useFollowedTopics(false), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedTopicsApi.getFollowed).not.toHaveBeenCalled();
  });
});

describe('useFollowTopic / useUnfollowTopic', () => {
  it('follow calls the API and resolves', async () => {
    mockedTopicsApi.follow.mockResolvedValue({ following: true, followersCount: 1 });

    const { result } = renderHook(() => useFollowTopic(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(5);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedTopicsApi.follow).toHaveBeenCalledWith(5);
  });

  it('unfollow calls the API and resolves', async () => {
    mockedTopicsApi.unfollow.mockResolvedValue({ following: false, followersCount: 0 });

    const { result } = renderHook(() => useUnfollowTopic(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(5);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedTopicsApi.unfollow).toHaveBeenCalledWith(5);
  });
});
