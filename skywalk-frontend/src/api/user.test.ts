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

  it('getUsersAdmin() should GET /users/admin/all with pagination params', async () => {
    get.mockResolvedValue({ data: { data: [{ idUser: 1 }], total: 1 } });
    const result = await userApi.getUsersAdmin(2, 50);
    expect(get).toHaveBeenCalledWith('/users/admin/all', {
      params: { page: 2, limit: 50 },
    });
    expect(result.total).toBe(1);
  });

  it('getUsersAdmin() should default page/limit when omitted', async () => {
    get.mockResolvedValue({ data: { data: [], total: 0 } });
    await userApi.getUsersAdmin();
    expect(get).toHaveBeenCalledWith('/users/admin/all', {
      params: { page: 1, limit: 100 },
    });
  });

  it('updateUserRole() should PATCH /users/admin/:id/role', async () => {
    patch.mockResolvedValue({ data: { idUser: 5, roles: 'admin' } });
    const result = await userApi.updateUserRole(5, 'admin');
    expect(patch).toHaveBeenCalledWith('/users/admin/5/role', { role: 'admin' });
    expect(result.roles).toBe('admin');
  });
});
