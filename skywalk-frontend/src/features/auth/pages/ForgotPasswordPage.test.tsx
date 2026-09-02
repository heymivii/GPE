import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from './ForgotPasswordPage';

vi.mock('../components/ForgotPasswordForm', () => ({
  default: () => <div data-testid="forgot-password-form" />,
}));

describe('ForgotPasswordPage', () => {
  it('renders the forgot-password form inside a centered card', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });
});
