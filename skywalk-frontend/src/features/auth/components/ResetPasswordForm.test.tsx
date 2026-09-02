import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResetPasswordForm from './ResetPasswordForm';

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

vi.mock('../../../api/auth', () => ({
  authApi: { resetPassword: vi.fn() },
}));

import { toast } from 'react-hot-toast';
import { authApi } from '../../../api/auth';
const mockedReset = vi.mocked(authApi.resetPassword);

function renderForm(initialEntry: string) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ResetPasswordForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an invalid-link message when there is no token in the URL', () => {
    renderForm('/auth/reset-password');
    expect(screen.getByText('auth.resetPassword.invalidLink')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'auth.resetPassword.requestNewLink' })).toHaveAttribute(
      'href',
      '/auth/forgot-password',
    );
  });

  it('rejects submission when the passwords do not match', async () => {
    renderForm('/auth/reset-password?token=abc');
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.resetPassword.newPassword'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.resetPassword.confirmPassword'), 'Different1!');
    await user.click(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));

    expect(await screen.findByText('auth.resetPassword.passwordMismatch')).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it('rejects a password below the medium-strength threshold', async () => {
    renderForm('/auth/reset-password?token=abc');
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.resetPassword.newPassword'), 'weak');
    await user.type(screen.getByPlaceholderText('auth.resetPassword.confirmPassword'), 'weak');
    await user.click(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));

    expect(await screen.findByText('auth.resetPassword.passwordWeak')).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it('submits the token and new password once validation passes', async () => {
    mockedReset.mockResolvedValue({ message: 'ok' });
    renderForm('/auth/reset-password?token=abc');
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.resetPassword.newPassword'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.resetPassword.confirmPassword'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));

    await waitFor(() =>
      expect(mockedReset).toHaveBeenCalledWith({ token: 'abc', newPassword: 'Secret123!' }),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/auth/login'));
    expect(toast.success).toHaveBeenCalledWith('auth.resetPassword.success');
  });

  it('surfaces the API error message on failure', async () => {
    mockedReset.mockRejectedValue({ response: { data: { message: 'Token expired' } } });
    renderForm('/auth/reset-password?token=abc');
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.resetPassword.newPassword'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.resetPassword.confirmPassword'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));

    expect(await screen.findByText('Token expired')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Token expired');
  });

  it('uses the Error instance message when the rejection is a plain Error', async () => {
    mockedReset.mockRejectedValue(new Error('boom'));
    renderForm('/auth/reset-password?token=abc');
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.resetPassword.newPassword'), 'Secret123!');
    await user.type(screen.getByPlaceholderText('auth.resetPassword.confirmPassword'), 'Secret123!');
    await user.click(screen.getByRole('button', { name: 'auth.resetPassword.submit' }));

    expect(await screen.findByText('boom')).toBeInTheDocument();
  });

  it('shows the strength meter with per-criterion marks once typing starts', async () => {
    renderForm('/auth/reset-password?token=abc');
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('auth.resetPassword.newPassword'), 'Secret123!');
    expect(screen.getByText('auth.resetPassword.strong')).toBeInTheDocument();
    expect(screen.getByText('8+')).toHaveClass('text-green-600');
  });
});
