import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../lib/api';
import { forumMessagesApi } from './forum-messages';

const get = apiClient.get as ReturnType<typeof vi.fn>;
const post = apiClient.post as ReturnType<typeof vi.fn>;
const patch = apiClient.patch as ReturnType<typeof vi.fn>;
const del = apiClient.delete as ReturnType<typeof vi.fn>;

describe('forumMessagesApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findAll() should GET /forum-message', async () => {
    get.mockResolvedValue({ data: [{ idMessage: 1 }] });
    const result = await forumMessagesApi.findAll();
    expect(get).toHaveBeenCalledWith('/forum-message');
    expect(result).toHaveLength(1);
  });

  it('findOne() should GET /forum-message/:id', async () => {
    get.mockResolvedValue({ data: { message_id: 5 } });
    const result = await forumMessagesApi.findOne(5);
    expect(get).toHaveBeenCalledWith('/forum-message/5');
    expect(result.message_id).toBe(5);
  });

  it('create() should POST /forum-message', async () => {
    const dto = { content: 'Hello', topicId: 1 };
    post.mockResolvedValue({ data: { message_id: 10, ...dto } });
    const result = await forumMessagesApi.create(dto as any);
    expect(post).toHaveBeenCalledWith('/forum-message', dto);
    expect(result.message_id).toBe(10);
  });

  it('update() should PATCH /forum-message/:id', async () => {
    patch.mockResolvedValue({ data: { idMessage: 1, content: 'Edited' } });
    const result = await forumMessagesApi.update(1, { content: 'Edited' } as any);
    expect(patch).toHaveBeenCalledWith('/forum-message/1', { content: 'Edited' });
    expect(result.content).toBe('Edited');
  });

  it('remove() should DELETE /forum-message/:id', async () => {
    del.mockResolvedValue({});
    await forumMessagesApi.remove(3);
    expect(del).toHaveBeenCalledWith('/forum-message/3');
  });

  it('moderatorRemove() should DELETE /forum-message/moderate/:id', async () => {
    del.mockResolvedValue({});
    await forumMessagesApi.moderatorRemove(7);
    expect(del).toHaveBeenCalledWith('/forum-message/moderate/7');
  });

  it('report() should POST /forum-message/report', async () => {
    const dto = { targetType: 'message', targetId: 1, reason: 'spam' };
    post.mockResolvedValue({ data: { idReport: 1, ...dto } });
    const result = await forumMessagesApi.report(dto as any);
    expect(post).toHaveBeenCalledWith('/forum-message/report', dto);
    expect(result.idReport).toBe(1);
  });

  it('getReports() should GET /forum-message/reports/all', async () => {
    get.mockResolvedValue({ data: [{ idReport: 1 }] });
    const result = await forumMessagesApi.getReports();
    expect(get).toHaveBeenCalledWith('/forum-message/reports/all');
    expect(result).toHaveLength(1);
  });

  it('getReports(status) should add query param', async () => {
    get.mockResolvedValue({ data: [] });
    await forumMessagesApi.getReports('pending');
    expect(get).toHaveBeenCalledWith('/forum-message/reports/all?status=pending');
  });

  it('getReportStats() should GET /forum-message/reports/stats', async () => {
    get.mockResolvedValue({ data: { total: 5, pending: 2 } });
    const result = await forumMessagesApi.getReportStats();
    expect(get).toHaveBeenCalledWith('/forum-message/reports/stats');
    expect(result.total).toBe(5);
  });

  it('resolveReport() should PATCH /forum-message/reports/:id/resolve', async () => {
    const dto = { action: 'resolved' };
    patch.mockResolvedValue({ data: { idReport: 1, status: 'resolved' } });
    const result = await forumMessagesApi.resolveReport(1, dto as any);
    expect(patch).toHaveBeenCalledWith('/forum-message/reports/1/resolve', dto);
    expect(result.status).toBe('resolved');
  });
});
