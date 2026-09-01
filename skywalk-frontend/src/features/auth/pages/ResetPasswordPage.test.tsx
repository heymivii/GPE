import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResetPasswordPage from './ResetPasswordPage';

vi.mock('../components/ResetPasswordForm', () => ({
  default: () => <div data-testid="reset-password-form" />,
}));

describe('ResetPasswordPage', () => {
  it('renders the reset-password form inside a centered card', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });
});
