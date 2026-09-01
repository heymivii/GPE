import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../api/user', () => ({
  userApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

const mockRefreshUser = vi.fn();
const mockLogout = vi.fn();
vi.mock('./useAuth', () => ({
  useAuth: () => ({ refreshUser: mockRefreshUser, logout: mockLogout }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import { userApi } from '../api/user';
import {
  useProfile,
  useUpdateProfile,
  useDeleteAccount,
  profileKeys,
} from './useProfile';

const mockedUserApi = vi.mocked(userApi);

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the current profile', async () => {
    mockedUserApi.getProfile.mockResolvedValue({ idUser: 1, email: 'a@b.com' } as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useProfile(), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ idUser: 1, email: 'a@b.com' });
  });

  it('useUpdateProfile updates the cache and refreshes the auth user on success', async () => {
    const updated = { idUser: 1, email: 'new@b.com' };
    mockedUserApi.updateProfile.mockResolvedValue(updated as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: wrapper(qc) });
    result.current.mutate({ email: 'new@b.com' } as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(qc.getQueryData(profileKeys.detail())).toEqual(updated);
    expect(mockRefreshUser).toHaveBeenCalled();
  });

  it('useDeleteAccount clears the cache, logs out, and redirects home', async () => {
    mockedUserApi.deleteAccount.mockResolvedValue(undefined);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const clearSpy = vi.spyOn(qc, 'clear');

    const { result } = renderHook(() => useDeleteAccount(), { wrapper: wrapper(qc) });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clearSpy).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
