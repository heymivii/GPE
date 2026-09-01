import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { forumModerationApi } from './forum-moderation';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('forumModerationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listWords() GETs /forum-moderation/words', async () => {
    mockedGet.mockResolvedValue({ data: [{ idForbiddenWord: 1 }] });
    const result = await forumModerationApi.listWords();
    expect(mockedGet).toHaveBeenCalledWith('/forum-moderation/words');
    expect(result).toEqual([{ idForbiddenWord: 1 }]);
  });

  it('createWord() POSTs to /forum-moderation/words', async () => {
    mockedPost.mockResolvedValue({ data: { idForbiddenWord: 1, word: 'x' } });
    const result = await forumModerationApi.createWord({ word: 'x' });
    expect(mockedPost).toHaveBeenCalledWith('/forum-moderation/words', { word: 'x' });
    expect(result.word).toBe('x');
  });

  it('updateWord() PATCHes /forum-moderation/words/:id', async () => {
    mockedPatch.mockResolvedValue({ data: { idForbiddenWord: 1, isActive: false } });
    const result = await forumModerationApi.updateWord(1, { isActive: false });
    expect(mockedPatch).toHaveBeenCalledWith('/forum-moderation/words/1', {
      isActive: false,
    });
    expect(result.isActive).toBe(false);
  });

  it('removeWord() DELETEs /forum-moderation/words/:id', async () => {
    mockedDelete.mockResolvedValue({});
    await forumModerationApi.removeWord(1);
    expect(mockedDelete).toHaveBeenCalledWith('/forum-moderation/words/1');
  });

  describe('flaggedUsers', () => {
    it('omits the threshold query param when not given', async () => {
      mockedGet.mockResolvedValue({ data: [] });
      await forumModerationApi.flaggedUsers();
      expect(mockedGet).toHaveBeenCalledWith('/forum-moderation/flagged-users');
    });

    it('includes the threshold query param when given', async () => {
      mockedGet.mockResolvedValue({ data: [] });
      await forumModerationApi.flaggedUsers(3);
      expect(mockedGet).toHaveBeenCalledWith(
        '/forum-moderation/flagged-users?threshold=3',
      );
    });
  });

  it('userWarnings() GETs /forum-moderation/users/:id/warnings', async () => {
    mockedGet.mockResolvedValue({ data: [{ idUserWarning: 1 }] });
    const result = await forumModerationApi.userWarnings(5);
    expect(mockedGet).toHaveBeenCalledWith('/forum-moderation/users/5/warnings');
    expect(result).toEqual([{ idUserWarning: 1 }]);
  });
});
