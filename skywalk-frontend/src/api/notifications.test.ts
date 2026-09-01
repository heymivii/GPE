import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

import apiClient from '../lib/api';
import { notificationsApi } from './notifications';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;

describe('notificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listMine() GETs /notification and unwraps the response data', async () => {
    mockedGet.mockResolvedValue({ data: [{ idNotification: 1 }] });
    const result = await notificationsApi.listMine();
    expect(mockedGet).toHaveBeenCalledWith('/notification');
    expect(result).toEqual([{ idNotification: 1 }]);
  });

  it('markAsRead() PATCHes /notification/:id/read', async () => {
    mockedPatch.mockResolvedValue({ data: { idNotification: 1, isRead: true } });
    const result = await notificationsApi.markAsRead(1);
    expect(mockedPatch).toHaveBeenCalledWith('/notification/1/read');
    expect(result.isRead).toBe(true);
  });

  it('markAllAsRead() PATCHes /notification/read-all', async () => {
    mockedPatch.mockResolvedValue({ data: { updated: 3 } });
    const result = await notificationsApi.markAllAsRead();
    expect(mockedPatch).toHaveBeenCalledWith('/notification/read-all');
    expect(result).toEqual({ updated: 3 });
  });
});
