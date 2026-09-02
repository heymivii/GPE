import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VisaChecker from './VisaChecker';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'fr' },
    t: (key: string, opts?: any) => (opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => ({
    countries: [
      { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
      { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
      { code: 'JP', name: 'Japon', flag: '🇯🇵' },
    ],
    nonSelectableCodes: new Set(['JP']),
  }),
}));

function renderChecker() {
  return render(
    <MemoryRouter>
      <VisaChecker />
    </MemoryRouter>,
  );
}

describe('VisaChecker', () => {
  it('excludes non-selectable countries from the destination list', () => {
    renderChecker();
    const destinationSelect = screen.getAllByRole('combobox')[1];
    expect(within(destinationSelect).queryByText(/Japon/)).not.toBeInTheDocument();
  });

  it('shows the visa-required verdict for a non-exempt pair by default', () => {
    renderChecker();
    expect(screen.getByText('landing.visaChecker.visaTitle')).toBeInTheDocument();
  });

  it('shows the exemption verdict for a free-movement pair (FR -> DE)', () => {
    renderChecker();
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'DE' } });
    expect(screen.getByText('landing.visaChecker.exemptTitle')).toBeInTheDocument();
  });

  it('links the CTA to onboarding pre-filled with the destination', () => {
    renderChecker();
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'DE' } });
    expect(screen.getByText('landing.visaChecker.cta').closest('a')).toHaveAttribute(
      'href',
      '/onboarding?to=DE',
    );
  });
});
