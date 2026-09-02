import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

import apiClient from '../lib/api';
import { expertsApi } from './experts';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;

describe('expertsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGet.mockResolvedValue({ data: [] });
    mockedPost.mockResolvedValue({ data: {} });
    mockedDelete.mockResolvedValue({ data: {} });
    mockedPatch.mockResolvedValue({ data: {} });
  });

  describe('list', () => {
    it('GETs the bare endpoint when no filters are given', async () => {
      await expertsApi.list();
      expect(mockedGet).toHaveBeenCalledWith('/users/experts');
    });

    it('appends countryId when given', async () => {
      await expertsApi.list({ countryId: 3 });
      expect(mockedGet).toHaveBeenCalledWith('/users/experts?countryId=3');
    });

    it('appends a trimmed q when given', async () => {
      await expertsApi.list({ q: '  lawyer  ' });
      expect(mockedGet).toHaveBeenCalledWith('/users/experts?q=lawyer');
    });

    it('omits q when it is blank after trimming', async () => {
      await expertsApi.list({ q: '   ' });
      expect(mockedGet).toHaveBeenCalledWith('/users/experts');
    });
  });

  it('verify() POSTs to /users/:id/verify-expert', async () => {
    await expertsApi.verify(5, { expertTitle: 'Lawyer' } as any);
    expect(mockedPost).toHaveBeenCalledWith('/users/5/verify-expert', {
      expertTitle: 'Lawyer',
    });
  });

  it('revoke() DELETEs /users/:id/verify-expert', async () => {
    await expertsApi.revoke(5);
    expect(mockedDelete).toHaveBeenCalledWith('/users/5/verify-expert');
  });

  it('updateMyProfile() PATCHes /users/me/expert-profile', async () => {
    await expertsApi.updateMyProfile({ expertBio: 'bio' });
    expect(mockedPatch).toHaveBeenCalledWith('/users/me/expert-profile', {
      expertBio: 'bio',
    });
  });
});
