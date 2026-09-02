import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginForm from './LoginForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockLogin = vi.fn();
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('../../../api/auth', () => ({
  authApi: { getProfile: vi.fn() },
}));

import { toast } from 'react-hot-toast';
import { authApi } from '../../../api/auth';

const mockedGetProfile = vi.mocked(authApi.getProfile);

function renderForm(initialEntry = '/auth/login') {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
  });

  it('submits the entered email and password', async () => {
    mockedGetProfile.mockResolvedValue({ role: 'user' } as any);
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('auth.login.email'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('auth.login.password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'auth.login.submit' }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret', rememberMe: false }),
    );
  });

  it('redirects a regular user to the default dashboard on success', async () => {
    mockedGetProfile.mockResolvedValue({ role: 'user' } as any);
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('auth.login.email'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('auth.login.password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'auth.login.submit' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
    expect(toast.success).toHaveBeenCalledWith('auth.login.success');
  });

  it('redirects to the ?redirect= target when present', async () => {
    mockedGetProfile.mockResolvedValue({ role: 'user' } as any);
    renderForm('/auth/login?redirect=%2Fprojects');
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('auth.login.email'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('auth.login.password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'auth.login.submit' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/projects'));
  });

  it('redirects an admin to /admin/dashboard regardless of the redirect param', async () => {
    mockedGetProfile.mockResolvedValue({ role: 'admin' } as any);
    renderForm('/auth/login?redirect=%2Fprojects');
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('auth.login.email'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('auth.login.password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'auth.login.submit' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard'));
  });

  it('recognizes the admin role from the "roles" field as well', async () => {
    mockedGetProfile.mockResolvedValue({ roles: 'ADMIN' } as any);
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('auth.login.email'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('auth.login.password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'auth.login.submit' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard'));
  });

  it('shows the API error message on failure', async () => {
    mockLogin.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('auth.login.email'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('auth.login.password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'auth.login.submit' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Invalid credentials'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('falls back to a generic error message when the API gives none', async () => {
    mockLogin.mockRejectedValue(new Error('network down'));
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('auth.login.email'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('auth.login.password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'auth.login.submit' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('auth.login.error'));
  });

  it('includes the encoded redirect target in the register link', () => {
    renderForm('/auth/login?redirect=%2Fprojects');
    const registerLink = screen.getByRole('link', { name: 'auth.login.register' });
    expect(registerLink).toHaveAttribute('href', '/auth/register?redirect=%2Fprojects');
  });
});
