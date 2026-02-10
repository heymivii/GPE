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
import { forumTopicsApi } from './forum-topics';

const get = apiClient.get as ReturnType<typeof vi.fn>;
const post = apiClient.post as ReturnType<typeof vi.fn>;
const patch = apiClient.patch as ReturnType<typeof vi.fn>;
const del = apiClient.delete as ReturnType<typeof vi.fn>;

describe('forumTopicsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findAll() should GET /forum-topic', async () => {
    get.mockResolvedValue({ data: [{ topic_id: 1 }] });
    const result = await forumTopicsApi.findAll();
    expect(get).toHaveBeenCalledWith('/forum-topic');
    expect(result).toHaveLength(1);
  });

  it('findOne() should GET /forum-topic/:id', async () => {
    get.mockResolvedValue({ data: { topic_id: 5, title: 'Test' } });
    const result = await forumTopicsApi.findOne(5);
    expect(get).toHaveBeenCalledWith('/forum-topic/5');
    expect(result.title).toBe('Test');
  });

  it('create() should POST /forum-topic', async () => {
    const dto = { title: 'New', content: 'Body', countryId: 1 };
    post.mockResolvedValue({ data: { topic_id: 10, ...dto } });
    const result = await forumTopicsApi.create(dto as any);
    expect(post).toHaveBeenCalledWith('/forum-topic', dto);
    expect(result.topic_id).toBe(10);
  });

  it('update() should PATCH /forum-topic/:id', async () => {
    patch.mockResolvedValue({ data: { topic_id: 1, title: 'Updated' } });
    const result = await forumTopicsApi.update(1, { title: 'Updated' } as any);
    expect(patch).toHaveBeenCalledWith('/forum-topic/1', { title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('remove() should DELETE /forum-topic/:id', async () => {
    del.mockResolvedValue({});
    await forumTopicsApi.remove(3);
    expect(del).toHaveBeenCalledWith('/forum-topic/3');
  });

  it('lockTopic() should PATCH /forum-topic/:id/lock', async () => {
    patch.mockResolvedValue({ data: { topic_id: 1 } });
    await forumTopicsApi.lockTopic(1);
    expect(patch).toHaveBeenCalledWith('/forum-topic/1/lock');
  });

  it('pinTopic() should PATCH /forum-topic/:id/pin', async () => {
    patch.mockResolvedValue({ data: { topic_id: 1 } });
    await forumTopicsApi.pinTopic(1);
    expect(patch).toHaveBeenCalledWith('/forum-topic/1/pin');
  });

  it('moderatorRemove() should DELETE /forum-topic/moderate/:id', async () => {
    del.mockResolvedValue({});
    await forumTopicsApi.moderatorRemove(7);
    expect(del).toHaveBeenCalledWith('/forum-topic/moderate/7');
  });
});
