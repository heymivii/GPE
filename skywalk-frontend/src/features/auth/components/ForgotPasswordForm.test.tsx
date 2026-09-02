import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ForgotPasswordForm from './ForgotPasswordForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => (opts ? `${key}:${JSON.stringify(opts)}` : key) }),
}));

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({ useMutation: vi.fn() }));

vi.mock('../../../api/auth', () => ({ authApi: { forgotPassword: vi.fn() } }));

const mockedUseMutation = vi.mocked(useMutation);
const mutate = vi.fn();

function setup({ isPending = false }: any = {}) {
  mockedUseMutation.mockImplementation(((config: any) => {
    return {
      mutate: (email: string) => {
        mutate(email);
        config.onSuccess?.();
      },
      isPending,
    };
  }) as any);
}

function renderForm() {
  return render(
    <MemoryRouter>
      <ForgotPasswordForm />
    </MemoryRouter>,
  );
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the email and shows a success toast', () => {
    setup();
    renderForm();
    fireEvent.change(screen.getByPlaceholderText('auth.forgotPassword.emailPlaceholder'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.click(screen.getByText('auth.forgotPassword.submit'));
    expect(mutate).toHaveBeenCalledWith('jane@example.com');
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows the success screen with a retry option after submission', () => {
    setup();
    renderForm();
    fireEvent.submit(screen.getByPlaceholderText('auth.forgotPassword.emailPlaceholder').closest('form')!);
    expect(screen.getByText('auth.forgotPassword.emailSentTitle')).toBeInTheDocument();
    fireEvent.click(screen.getByText('auth.forgotPassword.retry'));
    expect(screen.getByText('auth.forgotPassword.title')).toBeInTheDocument();
  });

  it('disables the form while submitting', () => {
    setup({ isPending: true });
    renderForm();
    expect(screen.getByPlaceholderText('auth.forgotPassword.emailPlaceholder')).toBeDisabled();
    expect(screen.getByText('auth.forgotPassword.submitting')).toBeInTheDocument();
  });

  it('shows an error toast on failure', () => {
    mockedUseMutation.mockImplementation(((config: any) => ({
      mutate: () => config.onError?.(new Error('Adresse introuvable')),
      isPending: false,
    })) as any);
    renderForm();
    fireEvent.change(screen.getByPlaceholderText('auth.forgotPassword.emailPlaceholder'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.click(screen.getByText('auth.forgotPassword.submit'));
    expect(toast.error).toHaveBeenCalledWith('Adresse introuvable');
  });
});
