import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import apiClient from '../lib/api';
import { privateMessagesApi } from './private-messages';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;

describe('privateMessagesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('send() POSTs the recipient and content', async () => {
    mockedPost.mockResolvedValue({});
    await privateMessagesApi.send(2, 'hello');
    expect(mockedPost).toHaveBeenCalledWith('/private-message', {
      recipientId: 2,
      content: 'hello',
    });
  });

  it('conversations() GETs /private-message/conversations', async () => {
    mockedGet.mockResolvedValue({ data: [{ userId: 2 }] });
    const result = await privateMessagesApi.conversations();
    expect(mockedGet).toHaveBeenCalledWith('/private-message/conversations');
    expect(result).toEqual([{ userId: 2 }]);
  });

  it('thread() GETs /private-message/with/:userId', async () => {
    mockedGet.mockResolvedValue({ data: [{ idPrivateMessage: 1 }] });
    const result = await privateMessagesApi.thread(2);
    expect(mockedGet).toHaveBeenCalledWith('/private-message/with/2');
    expect(result).toEqual([{ idPrivateMessage: 1 }]);
  });

  it('markRead() PATCHes /private-message/:id/read', async () => {
    mockedPatch.mockResolvedValue({});
    await privateMessagesApi.markRead(1);
    expect(mockedPatch).toHaveBeenCalledWith('/private-message/1/read');
  });

  it('unreadCount() GETs /private-message/unread-count', async () => {
    mockedGet.mockResolvedValue({ data: { count: 3 } });
    const result = await privateMessagesApi.unreadCount();
    expect(mockedGet).toHaveBeenCalledWith('/private-message/unread-count');
    expect(result).toEqual({ count: 3 });
  });
});
