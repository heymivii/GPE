import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DestinationStep from './DestinationStep';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
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

  it('flags an immediate error when origin and destination match', () => {
    render(<DestinationStep onNext={vi.fn()} />);
    const [fromSelect, toSelect] = screen.getAllByRole('combobox');
    fireEvent.change(fromSelect, { target: { value: 'FR' } });
    fireEvent.change(toSelect, { target: { value: 'FR' } });
    expect(screen.getByText('onboarding.destination.errors.sameCountry')).toBeInTheDocument();
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

  it('disables the country selects in edit mode and shows the helper text', () => {
    render(<DestinationStep onNext={vi.fn()} isEditMode data={{ fromCountry: 'FR', toCountry: 'DE', targetCity: '', departureYear: '' }} />);
    const [fromSelect, toSelect] = screen.getAllByRole('combobox');
    expect(fromSelect).toBeDisabled();
    expect(toSelect).toBeDisabled();
    expect(screen.getAllByText('onboarding.destination.cannotChangeCountry').length).toBe(2);
  });

  it('calls onBack when provided', () => {
    const onBack = vi.fn();
    render(<DestinationStep onNext={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByText('onboarding.nav.back'));
    expect(onBack).toHaveBeenCalled();
  });
});
