import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegisterPage from './RegisterPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('../components/RegisterForm', () => ({
  default: () => <div data-testid="register-form" />,
}));

describe('RegisterPage', () => {
  it('renders the title and the register form', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('heading', { name: 'authPages.registerTitle' })).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});
