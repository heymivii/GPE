import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pricing from './Pricing';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function renderPricing() {
  return render(
    <MemoryRouter>
      <Pricing />
    </MemoryRouter>,
  );
}

describe('Pricing', () => {
  it('renders the three pricing tiers', () => {
    renderPricing();
    expect(screen.getByText('landing.pricing.discovery.name')).toBeInTheDocument();
    expect(screen.getByText('landing.pricing.project.name')).toBeInTheDocument();
    expect(screen.getByText('landing.pricing.unlimited.name')).toBeInTheDocument();
  });

  it('marks the middle tier as popular', () => {
    renderPricing();
    expect(screen.getByText('landing.pricing.popular')).toBeInTheDocument();
  });

  it('shows the right feature count per tier', () => {
    renderPricing();
    expect(screen.getByText('landing.pricing.discovery.f4')).toBeInTheDocument();
    expect(screen.queryByText('landing.pricing.discovery.f5')).not.toBeInTheDocument();
    expect(screen.getByText('landing.pricing.project.f5')).toBeInTheDocument();
  });

  it('links every tier CTA to onboarding', () => {
    renderPricing();
    const ctas = [
      screen.getByText('landing.pricing.discovery.cta'),
      screen.getByText('landing.pricing.project.cta'),
      screen.getByText('landing.pricing.unlimited.cta'),
    ];
    ctas.forEach((cta) => expect(cta.closest('a')).toHaveAttribute('href', '/onboarding'));
  });
});
