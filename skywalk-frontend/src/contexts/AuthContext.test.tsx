import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';

// Mock the auth API
vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    refresh: vi.fn(),
  },
}));

import { authApi } from '../api/auth';

const mockedAuth = vi.mocked(authApi);

const fakeUser = {
  idUser: 1,
  email: 'test@test.com',
  fullName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

// Helper component to consume context
function TestConsumer() {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div>no context</div>;
  return (
    <div>
      <span data-testid="loading">{String(ctx.isLoading)}</span>
      <span data-testid="authenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.email : 'null'}</span>
      <button onClick={() => ctx.login({ email: 'a@b.com', password: '123' })}>
        login
      </button>
      <button onClick={() => ctx.register({ email: 'a@b.com', password: '123', firstName: 'A', lastName: 'B' })}>
        register
      </button>
      <button onClick={() => ctx.logout()}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should start with isLoading=true then resolve to unauthenticated when no token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should load user from token on mount', async () => {
    localStorage.setItem('access_token', 'valid-token');
    mockedAuth.getProfile.mockResolvedValue(fakeUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('test@test.com');
  });

  it('should try refresh token when getProfile fails', async () => {
    localStorage.setItem('access_token', 'expired-token');
    localStorage.setItem('refresh_token', 'valid-refresh');
    mockedAuth.getProfile
      .mockRejectedValueOnce(new Error('401'))
      .mockResolvedValueOnce(fakeUser);
    mockedAuth.refresh.mockResolvedValue({
      access_token: 'new-token',
      user: fakeUser,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(mockedAuth.refresh).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('should clear tokens when refresh also fails', async () => {
    localStorage.setItem('access_token', 'expired-token');
    localStorage.setItem('refresh_token', 'expired-refresh');
    mockedAuth.getProfile.mockRejectedValue(new Error('401'));
    mockedAuth.refresh.mockRejectedValue(new Error('401'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('login() should store tokens and set user', async () => {
    mockedAuth.login.mockResolvedValue({
      access_token: 'token-123',
      refresh_token: 'refresh-123',
      user: fakeUser,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    expect(localStorage.getItem('access_token')).toBe('token-123');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-123');
  });

  it('register() should store tokens and set user', async () => {
    mockedAuth.register.mockResolvedValue({
      access_token: 'reg-token',
      refresh_token: 'reg-refresh',
      user: fakeUser,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('register'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    expect(localStorage.getItem('access_token')).toBe('reg-token');
  });

  it('logout() should clear all tokens and user', async () => {
    localStorage.setItem('access_token', 'token');
    localStorage.setItem('refresh_token', 'refresh');
    localStorage.setItem('skywalk-onboarding-completed', 'true');
    mockedAuth.getProfile.mockResolvedValue(fakeUser);
    mockedAuth.logout.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('logout'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('skywalk-onboarding-completed')).toBeNull();
  });

  it('logout() should clear user even if API call fails', async () => {
    localStorage.setItem('access_token', 'token');
    mockedAuth.getProfile.mockResolvedValue(fakeUser);
    mockedAuth.logout.mockRejectedValue(new Error('network'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('logout'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });
});
