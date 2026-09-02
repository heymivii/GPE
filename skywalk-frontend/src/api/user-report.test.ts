import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import apiClient from '../lib/api';
import { userReportApi } from './user-report';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;

describe('userReportApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create() POSTs to /user-report', async () => {
    mockedPost.mockResolvedValue({ data: { idUserReport: 1 } });
    await userReportApi.create({ reportedUserId: 2, reason: 'spam' });
    expect(mockedPost).toHaveBeenCalledWith('/user-report', {
      reportedUserId: 2,
      reason: 'spam',
    });
  });

  describe('list', () => {
    it('omits the status query param when not given', async () => {
      mockedGet.mockResolvedValue({ data: [] });
      await userReportApi.list();
      expect(mockedGet).toHaveBeenCalledWith('/user-report');
    });

    it('includes the status query param when given', async () => {
      mockedGet.mockResolvedValue({ data: [] });
      await userReportApi.list('pending');
      expect(mockedGet).toHaveBeenCalledWith('/user-report?status=pending');
    });
  });

  it('stats() GETs /user-report/stats', async () => {
    mockedGet.mockResolvedValue({
      data: { pending: 1, resolved: 2, rejected: 0, total: 3 },
    });
    const result = await userReportApi.stats();
    expect(mockedGet).toHaveBeenCalledWith('/user-report/stats');
    expect(result.total).toBe(3);
  });

  it('resolve() PATCHes the action and moderatorNote', async () => {
    mockedPatch.mockResolvedValue({ data: { idUserReport: 1, status: 'resolved' } });
    const result = await userReportApi.resolve(1, 'resolved', 'ok');
    expect(mockedPatch).toHaveBeenCalledWith('/user-report/1/resolve', {
      action: 'resolved',
      moderatorNote: 'ok',
    });
    expect(result.status).toBe('resolved');
  });
});
