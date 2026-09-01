import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './LoginPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('../components/LoginForm', () => ({
  default: () => <div data-testid="login-form" />,
}));

describe('LoginPage', () => {
  it('renders the title and the login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'authPages.loginTitle' })).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
