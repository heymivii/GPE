import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('../../../api/auth', () => ({
  authApi: { login: vi.fn() },
}));

import { authApi } from '../../../api/auth';
import { useLogin } from './useLogin';

const mockedLogin = vi.mocked(authApi.login);

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls authApi.login with the credentials', async () => {
    mockedLogin.mockResolvedValue({ access_token: 'tok' } as any);
    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() });

    result.current.mutate({ email: 'a@b.com', password: '123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: '123' });
    expect(result.current.data).toEqual({ access_token: 'tok' });
  });

  it('surfaces a failed login as an error state', async () => {
    mockedLogin.mockRejectedValue(new Error('invalid credentials'));
    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() });

    result.current.mutate({ email: 'a@b.com', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
