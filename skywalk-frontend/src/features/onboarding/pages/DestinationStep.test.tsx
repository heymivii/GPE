import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DestinationStep from './DestinationStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'fr' },
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
  }),
}));

const useSupportedCountriesState = {
  countries: [
    { code: 'FR', i18nKey: 'countries.france', name: 'France' },
    { code: 'DE', i18nKey: 'countries.germany', name: 'Allemagne' },
    { code: 'ZZ', i18nKey: 'countries.hidden', name: 'Hidden' },
  ],
  nonSelectableCodes: new Set(['ZZ']),
  citiesByCode: {
    DE: [{ idCity: 1, name: 'Berlin' }],
  } as Record<string, { idCity: number; name: string }[]>,
  isLoading: false,
};
vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => useSupportedCountriesState,
}));

function fillRequired() {
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[0], { target: { value: 'FR' } }); // fromCountry
  fireEvent.change(selects[1], { target: { value: 'DE' } }); // toCountry
  fireEvent.change(selects[3], { target: { value: 'FR' } }); // nationality (index 2 is city)
  fireEvent.change(screen.getByLabelText(/Date de départ prévue/), {
    target: { value: '2099-06-01' },
  });
}

describe('DestinationStep', () => {
  it('excludes non-selectable countries from the destination options only', () => {
    render(<DestinationStep onNext={vi.fn()} />);
    const [fromSelect, toSelect] = screen.getAllByRole('combobox');
    expect(fromSelect).toHaveTextContent('Hidden');
    expect(toSelect).not.toHaveTextContent('Hidden');
  });

  it('disables Next until the required fields are filled', () => {
    render(<DestinationStep onNext={vi.fn()} />);
    expect(screen.getByText('onboarding.nav.next')).toBeDisabled();
    fillRequired();
    expect(screen.getByText('onboarding.nav.next')).not.toBeDisabled();
  });

  it('loads city options for the selected destination country', () => {
    render(<DestinationStep onNext={vi.fn()} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'DE' } });
    expect(selects[2]).toHaveTextContent('Berlin');
  });

  // Depuis la refonte, chaque liste exclut le choix de l'autre : le conflit
  // départ == destination ne peut plus être créé via l'UI, seulement arriver
  // en données pré-remplies (ancien projet « France → France »). Le garde-fou
  // de validateForm reste testé sur ce chemin-là.
  it('prevents picking the same country in both selects', () => {
    render(<DestinationStep onNext={vi.fn()} />);
    const [fromSelect, toSelect] = screen.getAllByRole('combobox');
    fireEvent.change(fromSelect, { target: { value: 'FR' } });
    expect(toSelect).not.toHaveTextContent('France');
    expect(fromSelect).toHaveTextContent('France');
  });

  it('keeps Next disabled on corrupt prefilled data (origin == destination)', () => {
    const onNext = vi.fn();
    render(
      <DestinationStep
        onNext={onNext}
        data={{ fromCountry: 'FR', toCountry: 'FR', targetCity: '', departureYear: '' }}
      />,
    );
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[3], { target: { value: 'FR' } }); // nationality
    fireEvent.change(screen.getByLabelText(/Date de départ prévue/), {
      target: { value: '2099-06-01' },
    });
    const nextButton = screen.getByText('onboarding.nav.next').closest('button');
    expect(nextButton).toBeDisabled();
    fireEvent.click(nextButton!);
    expect(onNext).not.toHaveBeenCalled();
  });

  it('calls onNext with the departure year derived from the departure date', () => {
    const onNext = vi.fn();
    render(<DestinationStep onNext={onNext} />);
    fillRequired();
    fireEvent.click(screen.getByText('onboarding.nav.next'));
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({
        fromCountry: 'FR',
        toCountry: 'DE',
        nationality: 'FR',
        departureDate: '2099-06-01',
        departureYear: '2099',
      }),
    );
  });

  // En édition, seul le pays de DESTINATION est verrouillé : le pays de départ
  // appartient au profil et reste modifiable (pour pouvoir réparer un
  // « France → France » hérité).
  it('disables only the destination select in edit mode and shows the helper texts', () => {
    render(<DestinationStep onNext={vi.fn()} isEditMode data={{ fromCountry: 'FR', toCountry: 'DE', targetCity: '', departureYear: '' }} />);
    const [fromSelect, toSelect] = screen.getAllByRole('combobox');
    expect(fromSelect).not.toBeDisabled();
    expect(toSelect).toBeDisabled();
    expect(screen.getByText('onboarding.destination.fromCountryProfileHelper')).toBeInTheDocument();
    expect(screen.getByText('onboarding.destination.cannotChangeCountry')).toBeInTheDocument();
  });

  it('calls onBack when provided', () => {
    const onBack = vi.fn();
    render(<DestinationStep onNext={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByText('onboarding.nav.back'));
    expect(onBack).toHaveBeenCalled();
  });
});
