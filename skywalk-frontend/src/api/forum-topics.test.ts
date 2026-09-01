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

  it('getFollowed() should GET /forum-topic/followed', async () => {
    get.mockResolvedValue({ data: [{ topic_id: 1 }] });
    const result = await forumTopicsApi.getFollowed();
    expect(get).toHaveBeenCalledWith('/forum-topic/followed');
    expect(result).toHaveLength(1);
  });

  it('follow() should POST /forum-topic/:id/follow', async () => {
    post.mockResolvedValue({ data: { following: true, followersCount: 3 } });
    const result = await forumTopicsApi.follow(1);
    expect(post).toHaveBeenCalledWith('/forum-topic/1/follow');
    expect(result).toEqual({ following: true, followersCount: 3 });
  });

  it('unfollow() should DELETE /forum-topic/:id/follow', async () => {
    del.mockResolvedValue({ data: { following: false, followersCount: 2 } });
    const result = await forumTopicsApi.unfollow(1);
    expect(del).toHaveBeenCalledWith('/forum-topic/1/follow');
    expect(result).toEqual({ following: false, followersCount: 2 });
  });

  describe('field mapping', () => {
    it('maps camelCase backend fields and nested messages/user to the frontend snake_case shape', async () => {
      get.mockResolvedValue({
        data: {
          idForumTopic: 9,
          createdAt: '2026-01-01',
          isPinned: true,
          isLocked: true,
          viewsCount: 42,
          messages: [
            {
              idForumMessage: 3,
              sentAt: '2026-01-02',
              user: {
                id: 7,
                firstName: 'Jean',
                lastName: 'Dupont',
                role: 'admin',
                isExpert: true,
                expertTitle: 'Notaire',
                expertVerifiedAt: '2026-01-01',
              },
            },
          ],
        },
      });

      const result = await forumTopicsApi.findOne(9);

      expect(result.topic_id).toBe(9);
      expect(result.created_at).toBe('2026-01-01');
      expect(result.is_pinned).toBe(true);
      expect(result.is_locked).toBe(true);
      expect(result.views_count).toBe(42);
      expect(result.messages?.[0].message_id).toBe(3);
      expect(result.messages?.[0].sent_at).toBe('2026-01-02');
      expect(result.messages?.[0].user).toEqual({
        idUser: 7,
        fullName: 'Jean Dupont',
        email: undefined,
        roles: 'admin',
        isExpert: true,
        expertTitle: 'Notaire',
        expertVerifiedAt: '2026-01-01',
      });
    });

    it('falls back to defaults when optional fields and the message user are absent', async () => {
      get.mockResolvedValue({
        data: { idForumTopic: 1, messages: [null] },
      });

      const result = await forumTopicsApi.findOne(1);

      expect(result.is_pinned).toBe(false);
      expect(result.is_locked).toBe(false);
      expect(result.views_count).toBe(0);
      expect(result.followersCount).toBe(0);
      expect(result.isFollowedByMe).toBe(false);
      expect(result.messages?.[0]).toBeUndefined();
    });

    it('falls back to "Anonymous" when the message author has no first name', async () => {
      get.mockResolvedValue({
        data: {
          idForumTopic: 1,
          messages: [{ idForumMessage: 1, user: { id: 2 } }],
        },
      });

      const result = await forumTopicsApi.findOne(1);

      expect(result.messages?.[0].user?.fullName).toBe('Anonymous');
      expect(result.messages?.[0].user?.isExpert).toBe(false);
    });
  });
});
