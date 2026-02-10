import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios-based apiClient
vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import apiClient from '../lib/api';
import { authApi } from './auth';

const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login() should POST to /auth/login', async () => {
    const mockResponse = {
      data: { access_token: 'tok', user: { idUser: 1, email: 'a@b.com', fullName: 'A', createdAt: '', updatedAt: '' } },
    };
    mockedPost.mockResolvedValue(mockResponse);

    const result = await authApi.login({ email: 'a@b.com', password: '123' });
    expect(mockedPost).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: '123' });
    expect(result.access_token).toBe('tok');
  });

  it('register() should POST to /auth/register', async () => {
    const mockResponse = {
      data: { access_token: 'tok', user: { idUser: 1, email: 'a@b.com', fullName: 'A B', createdAt: '', updatedAt: '' } },
    };
    mockedPost.mockResolvedValue(mockResponse);

    const result = await authApi.register({
      email: 'a@b.com', password: '123', firstName: 'A', lastName: 'B',
    });
    expect(mockedPost).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ email: 'a@b.com' }));
    expect(result.access_token).toBe('tok');
  });

  it('getProfile() should GET /auth/profile', async () => {
    const mockResponse = {
      data: { idUser: 1, email: 'a@b.com', fullName: 'A', createdAt: '', updatedAt: '' },
    };
    mockedGet.mockResolvedValue(mockResponse);

    const result = await authApi.getProfile();
    expect(mockedGet).toHaveBeenCalledWith('/auth/profile');
    expect(result.email).toBe('a@b.com');
  });

  it('logout() should POST to /auth/logout', async () => {
    mockedPost.mockResolvedValue({});
    await authApi.logout();
    expect(mockedPost).toHaveBeenCalledWith('/auth/logout');
  });

  it('refresh() should POST to /auth/refresh', async () => {
    const mockResponse = {
      data: { access_token: 'new-tok', user: { idUser: 1, email: 'a@b.com', fullName: 'A', createdAt: '', updatedAt: '' } },
    };
    mockedPost.mockResolvedValue(mockResponse);

    const result = await authApi.refresh({ refreshToken: 'old-refresh' });
    expect(mockedPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh' });
    expect(result.access_token).toBe('new-tok');
  });
});
