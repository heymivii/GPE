import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';
import PasswordForgotForm from './PasswordForgotForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@tanstack/react-query', () => ({ useMutation: vi.fn() }));

vi.mock('../../../api/auth', () => ({ authApi: { forgotPassword: vi.fn() } }));

const mockedUseMutation = vi.mocked(useMutation);
const mutate = vi.fn();

describe('PasswordForgotForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the email and shows the success banner', () => {
    mockedUseMutation.mockImplementation(((config: any) => ({
      mutate: (email: string) => {
        mutate(email);
        config.onSuccess?.();
      },
      isPending: false,
    })) as any);
    render(<PasswordForgotForm />);
    fireEvent.change(screen.getByPlaceholderText('auth.passwordForgot.emailPlaceholder'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.click(screen.getByText('auth.passwordForgot.submit'));
    expect(mutate).toHaveBeenCalledWith('jane@example.com');
    expect(screen.getByText('auth.passwordForgot.success')).toBeInTheDocument();
  });

  it('shows an error banner on failure', () => {
    mockedUseMutation.mockImplementation(((config: any) => ({
      mutate: () => config.onError?.({ response: { data: { message: 'Adresse invalide' } } }),
      isPending: false,
    })) as any);
    render(<PasswordForgotForm />);
    fireEvent.change(screen.getByPlaceholderText('auth.passwordForgot.emailPlaceholder'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.click(screen.getByText('auth.passwordForgot.submit'));
    expect(screen.getByText('Adresse invalide')).toBeInTheDocument();
  });

  it('falls back to a generic error message', () => {
    mockedUseMutation.mockImplementation(((config: any) => ({
      mutate: () => config.onError?.({}),
      isPending: false,
    })) as any);
    render(<PasswordForgotForm />);
    fireEvent.change(screen.getByPlaceholderText('auth.passwordForgot.emailPlaceholder'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.click(screen.getByText('auth.passwordForgot.submit'));
    expect(screen.getByText('auth.passwordForgot.error')).toBeInTheDocument();
  });

  it('disables the form while submitting', () => {
    mockedUseMutation.mockReturnValue({ mutate, isPending: true } as any);
    render(<PasswordForgotForm />);
    expect(screen.getByPlaceholderText('auth.passwordForgot.emailPlaceholder')).toBeDisabled();
    expect(screen.getByText('auth.passwordForgot.submitting')).toBeInTheDocument();
  });
});
