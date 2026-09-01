import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CountrySelector from './CountrySelector';
import type { EnrichedCountry } from '../hooks/useCountriesWithData';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
  }),
}));

vi.mock('../../../data/supportedCountries', () => ({
  SUPPORTED_COUNTRIES: [{ code: 'FR', i18nKey: 'countries.france' }],
}));

const france: EnrichedCountry = {
  idCountry: 1,
  countryName: 'France',
  isoCode: 'FR',
  uniqueId: 'country-1',
  isCity: false,
  continent: 'Europe',
} as any;

const paris: EnrichedCountry = {
  idCountry: 1,
  countryName: 'Paris',
  uniqueId: 'city-paris',
  isCity: true,
  parentId: 1,
  continent: 'Europe',
} as any;

const japan: EnrichedCountry = {
  idCountry: 2,
  countryName: 'Japan',
  isoCode: 'JP',
  uniqueId: 'country-2',
  isCity: false,
  continent: 'Asia',
} as any;

const germany: EnrichedCountry = {
  idCountry: 3,
  countryName: 'Germany',
  isoCode: 'DE',
  uniqueId: 'country-3',
  isCity: false,
  continent: 'Europe',
} as any;

const berlin: EnrichedCountry = {
  idCountry: 3,
  countryName: 'Berlin',
  uniqueId: 'city-berlin',
  isCity: true,
  parentId: 3,
  continent: 'Europe',
} as any;

const allCountries = [france, paris, japan];
const allCountriesWithGermany = [france, paris, japan, germany, berlin];

function openDropdown() {
  fireEvent.click(screen.getByText(/Sélectionner un pays|Ajouter un pays/));
}

describe('CountrySelector', () => {
  it('renders a chip for each selected country with a remove button', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector
        countries={allCountries}
        selectedCountries={['country-1']}
        onCountryToggle={onToggle}
        maxSelection={3}
      />,
    );
    expect(screen.getByText('France')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.remove' }));
    expect(onToggle).toHaveBeenCalledWith('country-1');
  });

  it('hides the add-country trigger once the max selection is reached', () => {
    render(
      <CountrySelector
        countries={allCountries}
        selectedCountries={['country-1', 'country-2']}
        onCountryToggle={vi.fn()}
        maxSelection={2}
      />,
    );
    expect(screen.queryByText(/Sélectionner un pays|Ajouter un pays/)).not.toBeInTheDocument();
  });

  it('opens the dropdown showing only top-level (non-city) destinations', () => {
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={vi.fn()} maxSelection={3} />,
    );
    openDropdown();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
    expect(screen.queryByText('Paris')).not.toBeInTheDocument();
  });

  it('filters the list by search text', () => {
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={vi.fn()} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.change(screen.getByPlaceholderText('Rechercher un pays...'), { target: { value: 'jap' } });
    expect(screen.getByText('Japan')).toBeInTheDocument();
    expect(screen.queryByText('France')).not.toBeInTheDocument();
  });

  it('shows a no-results message when the search matches nothing', () => {
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={vi.fn()} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.change(screen.getByPlaceholderText('Rechercher un pays...'), { target: { value: 'zzz' } });
    expect(screen.getByText('Aucune destination trouvée')).toBeInTheDocument();
  });

  it('drills into a country that has cities instead of selecting it directly', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={onToggle} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('France'));

    expect(onToggle).not.toHaveBeenCalled();
    expect(screen.getByText('Tout le pays')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('selects the whole country from the drill-down view', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={onToggle} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Tout le pays'));
    expect(onToggle).toHaveBeenCalledWith('country-1');
  });

  it('selects a specific city from the drill-down view', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={onToggle} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Paris'));
    expect(onToggle).toHaveBeenCalledWith('city-paris');
  });

  it('selects a country with no cities directly, without drilling down', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={onToggle} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('Japan'));
    expect(onToggle).toHaveBeenCalledWith('country-2');
  });

  it('blocks selecting a childless country once a city is already selected (mixed types forbidden)', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector
        countries={allCountries}
        selectedCountries={['city-paris']}
        onCountryToggle={onToggle}
        maxSelection={3}
      />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('Japan'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('drills into a country with children even when a city is already selected', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector
        countries={allCountriesWithGermany}
        selectedCountries={['city-paris']}
        onCountryToggle={onToggle}
        maxSelection={3}
      />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('Germany'));
    expect(onToggle).not.toHaveBeenCalled();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
  });

  it('blocks selecting the whole country from the drill-down view when a city is already selected', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector
        countries={allCountriesWithGermany}
        selectedCountries={['city-paris']}
        onCountryToggle={onToggle}
        maxSelection={3}
      />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('Germany'));
    fireEvent.click(screen.getByText('Tout le pays'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('closes the dropdown and resets the search/drill-down state when clicking outside', () => {
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={vi.fn()} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.change(screen.getByPlaceholderText('Rechercher un pays...'), { target: { value: 'jap' } });
    expect(screen.getByText('Japan')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByPlaceholderText('Rechercher un pays...')).not.toBeInTheDocument();
  });

  it('closes the dropdown via the mobile backdrop overlay', () => {
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={vi.fn()} maxSelection={3} />,
    );
    openDropdown();
    const overlay = document.querySelector('.fixed.inset-0.bg-gray-900\\/40');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as Element);
    expect(screen.queryByPlaceholderText('Rechercher un pays...')).not.toBeInTheDocument();
  });

  it('closes the dropdown via the mobile header close button', () => {
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={vi.fn()} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('Ajouter une destination').parentElement!.querySelector('button')!);
    expect(screen.queryByPlaceholderText('Rechercher un pays...')).not.toBeInTheDocument();
  });

  it('closes the dropdown when the selection reaches maxSelection from the drill-down view', () => {
    const onToggle = vi.fn();
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={onToggle} maxSelection={1} />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Paris'));

    expect(onToggle).toHaveBeenCalledWith('city-paris');
    expect(screen.queryByPlaceholderText('Rechercher un pays...')).not.toBeInTheDocument();
  });

  it('returns to the top-level list via the drill-down back button', () => {
    render(
      <CountrySelector countries={allCountries} selectedCountries={[]} onCountryToggle={vi.fn()} maxSelection={3} />,
    );
    openDropdown();
    fireEvent.click(screen.getByText('France'));
    expect(screen.getByText('Paris')).toBeInTheDocument();

    // The back chevron is the only button rendered before the search input in the drill-down toolbar.
    const backButton = screen.getByPlaceholderText('Rechercher un pays...')
      .closest('div.p-3')!
      .querySelector('button')!;
    fireEvent.click(backButton);

    expect(screen.queryByText('Paris')).not.toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });
});
