import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CountrySelector from './CountrySelector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => ({
    countries: [
      { slug: 'france', name: 'France', i18nKey: 'countries.france', flag: '🇫🇷' },
      { slug: 'canada', name: 'Canada', i18nKey: 'countries.canada', flag: '🇨🇦' },
    ],
  }),
}));

describe('CountrySelector', () => {
  const onCountryChange = vi.fn();

  beforeEach(() => {
    onCountryChange.mockClear();
  });

  it('shows the generic placeholder when nothing is selected', () => {
    render(<CountrySelector selectedCountry={null} onCountryChange={onCountryChange} />);
    expect(screen.getByText(/services\.countrySelector\.general/)).toBeInTheDocument();
  });

  it('shows the selected country flag and name', () => {
    render(<CountrySelector selectedCountry="france" onCountryChange={onCountryChange} />);
    expect(screen.getByText('🇫🇷 countries.france')).toBeInTheDocument();
  });

  it('lists every supported country when opened', () => {
    render(<CountrySelector selectedCountry={null} onCountryChange={onCountryChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('countries.france')).toBeInTheDocument();
    expect(screen.getByText('countries.canada')).toBeInTheDocument();
  });

  it('does not show the "general info" option by default', () => {
    render(<CountrySelector selectedCountry={null} onCountryChange={onCountryChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('services.countrySelector.generalInfo')).not.toBeInTheDocument();
  });

  it('shows the "general info" option when showGenericOption is set, and selecting it clears the country', () => {
    render(
      <CountrySelector selectedCountry="france" onCountryChange={onCountryChange} showGenericOption />,
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('services.countrySelector.generalInfo'));
    expect(onCountryChange).toHaveBeenCalledWith(null);
  });

  it('calls onCountryChange with the picked country slug', () => {
    render(<CountrySelector selectedCountry={null} onCountryChange={onCountryChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('countries.canada'));
    expect(onCountryChange).toHaveBeenCalledWith('canada');
  });
});
