import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { useAuth } from '../../../hooks/useAuth';
import type { Step } from './Stepper';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.defaultValue ?? key }),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockedUseAuth = vi.mocked(useAuth);

const steps: Step[] = [
  { id: 1, label: 'Destination', state: 'done' },
  { id: 2, label: 'Profil', state: 'current' },
];

function renderLayout(isAuthenticated: boolean) {
  mockedUseAuth.mockReturnValue({ isAuthenticated } as any);
  return render(
    <MemoryRouter>
      <OnboardingLayout steps={steps}>
        <div>Step content</div>
      </OnboardingLayout>
    </MemoryRouter>,
  );
}

describe('OnboardingLayout', () => {
  it('renders the step content and the stepper', () => {
    renderLayout(false);
    expect(screen.getByText('Step content')).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
  });

  it('shows the current step in the breadcrumb', () => {
    renderLayout(false);
    expect(screen.getAllByText('Profil').length).toBeGreaterThan(1);
  });

  it('includes a dashboard breadcrumb link only when authenticated', () => {
    renderLayout(true);
    expect(screen.getByText('onboarding.layout.dashboard')).toBeInTheDocument();
  });

  it('omits the dashboard breadcrumb link when logged out', () => {
    renderLayout(false);
    expect(screen.queryByText('onboarding.layout.dashboard')).not.toBeInTheDocument();
  });

  it('links the mobile "quit" button to the right destination', () => {
    renderLayout(true);
    expect(screen.getByText('Quitter').closest('a')).toHaveAttribute('href', '/dashboard');
  });
});
