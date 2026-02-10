import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  forumKeys,
  useForumTopics,
  useForumTopic,
  useForumMessages,
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
