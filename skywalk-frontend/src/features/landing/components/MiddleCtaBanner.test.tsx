import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MiddleCtaBanner from './MiddleCtaBanner';
import { useAuth } from '../../../hooks/useAuth';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockedUseAuth = vi.mocked(useAuth);

function renderBanner() {
  return render(
    <MemoryRouter>
      <MiddleCtaBanner />
    </MemoryRouter>,
  );
}

describe('MiddleCtaBanner', () => {
  it('links straight to onboarding when authenticated', () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true } as any);
    renderBanner();
    expect(screen.getByText('landing.ctaBanner.cta').closest('a')).toHaveAttribute('href', '/onboarding');
  });

  it('links to registration first when logged out', () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false } as any);
    renderBanner();
    expect(screen.getByText('landing.ctaBanner.cta').closest('a')).toHaveAttribute(
      'href',
      '/auth/register?redirect=/onboarding',
    );
  });
});
