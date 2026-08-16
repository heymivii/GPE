import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { pmKeys, useConversations, useSendMessage } from './usePrivateMessages';

vi.mock('../api/private-messages', () => ({
  privateMessagesApi: {
    send: vi.fn(),
    conversations: vi.fn(),
    thread: vi.fn(),
    markRead: vi.fn(),
    unreadCount: vi.fn(),
  },
}));

import { privateMessagesApi } from '../api/private-messages';
const mocked = vi.mocked(privateMessagesApi);

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('pmKeys', () => {
  it('builds keys', () => {
    expect(pmKeys.conversations()).toEqual(['private-messages', 'conversations']);
    expect(pmKeys.thread(5)).toEqual(['private-messages', 'thread', 5]);
    expect(pmKeys.unread()).toEqual(['private-messages', 'unread']);
  });
});

describe('useConversations', () => {
  it('fetches conversations', async () => {
    mocked.conversations.mockResolvedValue([
      { userId: 2, fullName: 'Bob', lastMessage: 'hi', lastAt: '', unread: 1 },
    ]);
    const { result } = renderHook(() => useConversations(true), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useSendMessage', () => {
  it('sends a message via the API', async () => {
    mocked.send.mockResolvedValue(undefined as any);
    const { result } = renderHook(() => useSendMessage(), { wrapper: wrapper() });
    result.current.mutate({ recipientId: 2, content: 'hello' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.send).toHaveBeenCalledWith(2, 'hello');
  });
});
