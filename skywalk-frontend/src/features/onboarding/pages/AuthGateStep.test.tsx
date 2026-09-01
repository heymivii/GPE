import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthGateStep from './AuthGateStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

function renderStep(props: Partial<React.ComponentProps<typeof AuthGateStep>> = {}) {
  return render(
    <MemoryRouter>
      <AuthGateStep onBack={vi.fn()} {...props} />
    </MemoryRouter>,
  );
}

describe('AuthGateStep', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the benefits list', () => {
    renderStep();
    expect(screen.getByText('onboarding.authGate.benefit1')).toBeInTheDocument();
    expect(screen.getByText('onboarding.authGate.benefit4')).toBeInTheDocument();
  });

  it('builds the register/login links with a redirect back to onboarding', () => {
    renderStep();
    const createAccount = screen.getByText('onboarding.authGate.createAccount').closest('a')!;
    const hasAccount = screen.getByText('onboarding.authGate.hasAccount').closest('a')!;
    expect(createAccount).toHaveAttribute(
      'href',
      expect.stringContaining('/auth/register?redirect=%2Fonboarding%3Fsave%3Dtrue'),
    );
    expect(hasAccount).toHaveAttribute(
      'href',
      expect.stringContaining('/auth/login?redirect=%2Fonboarding%3Fsave%3Dtrue'),
    );
  });

  it('appends the age to the register link when provided', () => {
    renderStep({ age: '30' });
    const createAccount = screen.getByText('onboarding.authGate.createAccount').closest('a')!;
    expect(createAccount).toHaveAttribute('href', expect.stringContaining('&age=30'));
  });

  it('flags the pending save in localStorage when the create-account link is clicked', () => {
    renderStep();
    fireEvent.click(screen.getByText('onboarding.authGate.createAccount'));
    expect(localStorage.getItem('skywalk-should-save')).toBe('true');
  });

  it('flags the pending save in localStorage when the login link is clicked', () => {
    renderStep();
    fireEvent.click(screen.getByText('onboarding.authGate.hasAccount'));
    expect(localStorage.getItem('skywalk-should-save')).toBe('true');
  });

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn();
    renderStep({ onBack });
    fireEvent.click(screen.getByText('onboarding.authGate.goBack'));
    expect(onBack).toHaveBeenCalled();
  });
});
