import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../lib/api';
import { userApi } from './user';

const get = apiClient.get as ReturnType<typeof vi.fn>;
const patch = apiClient.patch as ReturnType<typeof vi.fn>;
const del = apiClient.delete as ReturnType<typeof vi.fn>;

describe('userApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getProfile() should GET /users/me', async () => {
    get.mockResolvedValue({ data: { idUser: 1, email: 'a@b.com' } });
    const result = await userApi.getProfile();
    expect(get).toHaveBeenCalledWith('/users/me');
    expect(result.email).toBe('a@b.com');
  });

  it('updateProfile() should PATCH /users/me', async () => {
    patch.mockResolvedValue({ data: { idUser: 1, firstName: 'New' } });
    const result = await userApi.updateProfile({ firstName: 'New' });
    expect(patch).toHaveBeenCalledWith('/users/me', { firstName: 'New' });
    expect(result.firstName).toBe('New');
  });

  it('deleteAccount() should DELETE /users/me', async () => {
    del.mockResolvedValue({});
    await userApi.deleteAccount();
    expect(del).toHaveBeenCalledWith('/users/me');
  });
});
