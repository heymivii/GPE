import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  forumKeys,
  useForumTopics,
  useForumTopic,
  useCreateForumTopic,
  useUpdateForumTopic,
  useDeleteForumTopic,
  useForumMessages,
  useForumMessage,
  useForumMessagesByTopic,
  useCreateForumMessage,
  useUpdateForumMessage,
  useDeleteForumMessage,
  useReportContent,
  useForumReports,
  useReportStats,
  useResolveReport,
  useLockTopic,
  usePinTopic,
  useModeratorDeleteMessage,
  useModeratorDeleteTopic,
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

describe('useCreateForumTopic', () => {
  it('creates a topic and invalidates the topics list', async () => {
    mockedTopicsApi.create.mockResolvedValue({ topic_id: 1 } as any);
    const { result } = renderHook(() => useCreateForumTopic(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ title: 'New' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedTopicsApi.create).toHaveBeenCalledWith({ title: 'New' });
  });
});

describe('useUpdateForumTopic', () => {
  it('updates a topic', async () => {
    mockedTopicsApi.update.mockResolvedValue({ topic_id: 1, title: 'Upd' } as any);
    const { result } = renderHook(() => useUpdateForumTopic(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, data: { title: 'Upd' } as any });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedTopicsApi.update).toHaveBeenCalledWith(1, { title: 'Upd' });
  });
});

describe('useDeleteForumTopic', () => {
  it('removes a topic', async () => {
    mockedTopicsApi.remove.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteForumTopic(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedTopicsApi.remove).toHaveBeenCalledWith(1);
  });
});

describe('useForumMessage', () => {
  it('fetches a single message', async () => {
    mockedMessagesApi.findOne.mockResolvedValue({ message_id: 1 } as any);
    const { result } = renderHook(() => useForumMessage(1), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.findOne).toHaveBeenCalledWith(1);
  });

  it('does not fetch when id is 0', () => {
    const { result } = renderHook(() => useForumMessage(0), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useForumMessagesByTopic', () => {
  it('fetches messages for a topic', async () => {
    mockedMessagesApi.findByTopic.mockResolvedValue([{ message_id: 1 } as any]);
    const { result } = renderHook(() => useForumMessagesByTopic(3), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.findByTopic).toHaveBeenCalledWith(3);
  });

  it('does not fetch when topicId is 0', () => {
    const { result } = renderHook(() => useForumMessagesByTopic(0), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateForumMessage', () => {
  it('creates a message', async () => {
    mockedMessagesApi.create.mockResolvedValue({ message_id: 1, topicId: 3 } as any);
    const { result } = renderHook(() => useCreateForumMessage(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ content: 'Hi', topicId: 3 } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.create).toHaveBeenCalledWith({ content: 'Hi', topicId: 3 });
  });
});

describe('useUpdateForumMessage', () => {
  it('updates a message and invalidates the related topic when topicId is given', async () => {
    mockedMessagesApi.update.mockResolvedValue({ message_id: 1 } as any);
    const { result } = renderHook(() => useUpdateForumMessage(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, data: { content: 'Upd' } as any, topicId: 3 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.update).toHaveBeenCalledWith(1, { content: 'Upd' });
  });

  it('updates a message without a topicId', async () => {
    mockedMessagesApi.update.mockResolvedValue({ message_id: 1 } as any);
    const { result } = renderHook(() => useUpdateForumMessage(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, data: { content: 'Upd' } as any });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useDeleteForumMessage', () => {
  it('removes a message and invalidates the related topic when topicId is given', async () => {
    mockedMessagesApi.remove.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteForumMessage(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, topicId: 3 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.remove).toHaveBeenCalledWith(1);
  });

  it('removes a message without a topicId', async () => {
    mockedMessagesApi.remove.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteForumMessage(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useReportContent', () => {
  it('reports content', async () => {
    mockedMessagesApi.report.mockResolvedValue({ report_id: 1 } as any);
    const { result } = renderHook(() => useReportContent(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ messageId: 1, reason: 'spam' } as any);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.report).toHaveBeenCalledWith({ messageId: 1, reason: 'spam' });
  });
});

describe('useForumReports', () => {
  it('fetches reports filtered by status', async () => {
    mockedMessagesApi.getReports.mockResolvedValue([{ report_id: 1 } as any]);
    const { result } = renderHook(() => useForumReports('pending'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.getReports).toHaveBeenCalledWith('pending');
  });
});

describe('useReportStats', () => {
  it('fetches report statistics', async () => {
    mockedMessagesApi.getReportStats.mockResolvedValue({ pending: 1 } as any);
    const { result } = renderHook(() => useReportStats(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ pending: 1 });
  });
});

describe('useResolveReport', () => {
  it('resolves a report', async () => {
    mockedMessagesApi.resolveReport.mockResolvedValue({ report_id: 1, status: 'resolved' } as any);
    const { result } = renderHook(() => useResolveReport(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, data: { action: 'resolved' } as any });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.resolveReport).toHaveBeenCalledWith(1, { action: 'resolved' });
  });
});

describe('useLockTopic / usePinTopic', () => {
  it('locks a topic', async () => {
    mockedTopicsApi.lockTopic.mockResolvedValue({ topic_id: 1, isLocked: true } as any);
    const { result } = renderHook(() => useLockTopic(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedTopicsApi.lockTopic).toHaveBeenCalledWith(1);
  });

  it('pins a topic', async () => {
    mockedTopicsApi.pinTopic.mockResolvedValue({ topic_id: 1, isPinned: true } as any);
    const { result } = renderHook(() => usePinTopic(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedTopicsApi.pinTopic).toHaveBeenCalledWith(1);
  });
});

describe('useModeratorDeleteMessage / useModeratorDeleteTopic', () => {
  it('moderator-deletes a message with a topicId', async () => {
    mockedMessagesApi.moderatorRemove.mockResolvedValue(undefined);
    const { result } = renderHook(() => useModeratorDeleteMessage(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1, topicId: 3 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMessagesApi.moderatorRemove).toHaveBeenCalledWith(1);
  });

  it('moderator-deletes a message without a topicId', async () => {
    mockedMessagesApi.moderatorRemove.mockResolvedValue(undefined);
    const { result } = renderHook(() => useModeratorDeleteMessage(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('moderator-deletes a topic', async () => {
    mockedTopicsApi.moderatorRemove.mockResolvedValue(undefined);
    const { result } = renderHook(() => useModeratorDeleteTopic(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedTopicsApi.moderatorRemove).toHaveBeenCalledWith(1);
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

  it('rolls back the optimistic follow update on error', async () => {
    mockedTopicsApi.follow.mockRejectedValue(new Error('network down'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(forumKeys.topic(5), {
      topic_id: 5,
      isFollowedByMe: false,
      followersCount: 2,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useFollowTopic(), { wrapper });
    result.current.mutate(5);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.getQueryData(forumKeys.topic(5))).toEqual({
      topic_id: 5,
      isFollowedByMe: false,
      followersCount: 2,
    });
  });

  it('rolls back the optimistic unfollow update on error', async () => {
    mockedTopicsApi.unfollow.mockRejectedValue(new Error('network down'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(forumKeys.topic(5), {
      topic_id: 5,
      isFollowedByMe: true,
      followersCount: 3,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUnfollowTopic(), { wrapper });
    result.current.mutate(5);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.getQueryData(forumKeys.topic(5))).toEqual({
      topic_id: 5,
      isFollowedByMe: true,
      followersCount: 3,
    });
  });
});
