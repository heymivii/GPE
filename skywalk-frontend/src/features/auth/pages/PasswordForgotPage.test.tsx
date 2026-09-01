import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordForgotPage from './PasswordForgotPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('../components/PasswordForgotForm', () => ({
  default: () => <div data-testid="password-forgot-form" />,
}));

describe('PasswordForgotPage', () => {
  it('renders the title, subtitle, and the form', () => {
    render(<PasswordForgotPage />);
    expect(screen.getByRole('heading', { name: 'authPages.forgotPasswordTitle' })).toBeInTheDocument();
    expect(screen.getByText('authPages.forgotPasswordSubtitle')).toBeInTheDocument();
    expect(screen.getByTestId('password-forgot-form')).toBeInTheDocument();
  });
});
