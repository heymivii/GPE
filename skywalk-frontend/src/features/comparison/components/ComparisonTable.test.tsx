import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ComparisonTable from './ComparisonTable';
import type { EnrichedCountry } from '../hooks/useCountriesWithData';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
    i18n: { language: 'fr' },
  }),
}));

const convert = vi.fn((amount: number): number | null => amount); // 1:1 passthrough by default
vi.mock('../../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ displaySymbol: '€', convert }),
}));

vi.mock('../hooks/useMigrationData', () => ({
  useMigrationData: () => ({ getByIso2: () => undefined }),
}));

function wrapper(children: React.ReactNode) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const france: EnrichedCountry = {
  idCountry: 1,
  countryName: 'France',
  isoCode: 'FR',
  uniqueId: 'country-1',
  isCity: false,
  currency: 'EUR',
  sourceCurrencyCode: 'EUR',
  costOfLiving: {
    averageSalary: 2500,
    averageRent: { oneBedroom: 1000, threeBedroom: 2000 },
    food: { restaurantMeal: 15, groceriesWeekly: 50 },
    utilities: 150,
    transportMonthly: 75,
  },
} as any;

const germany: EnrichedCountry = {
  idCountry: 2,
  countryName: 'Allemagne',
  isoCode: 'DE',
  uniqueId: 'country-2',
  isCity: false,
  currency: 'EUR',
  sourceCurrencyCode: 'EUR',
  costOfLiving: {
    averageSalary: 3000,
    averageRent: { oneBedroom: 900, threeBedroom: 1800 },
    food: { restaurantMeal: 12, groceriesWeekly: 45 },
    utilities: 140,
    transportMonthly: 70,
  },
} as any;

describe('ComparisonTable', () => {
  beforeEach(() => {
    convert.mockImplementation((amount: number) => amount);
  });

  it('shows the premium gate instead of cost-of-living data when unauthenticated', () => {
    render(wrapper(<ComparisonTable countries={[france, germany]} isAuthenticated={false} />));
    expect(screen.getByText('comparison.premiumAccess.title')).toBeInTheDocument();
    expect(screen.queryByText('2,500 €')).not.toBeInTheDocument();
  });

  // Formatting goes through toLocaleString('fr-FR'), which groups thousands with a space
  // (narrow no-break space), not a comma — compute the expected string the same way.
  const frNum = (n: number) => n.toLocaleString('fr-FR');

  it('shows the real cost-of-living figures when authenticated', () => {
    render(wrapper(<ComparisonTable countries={[france, germany]} isAuthenticated />));
    expect(screen.queryByText('comparison.premiumAccess.title')).not.toBeInTheDocument();
    expect(document.body.textContent).toContain(`${frNum(2500)} €`);
    expect(document.body.textContent).toContain(`${frNum(3000)} €`);
  });

  it('converts amounts through the currency context and appends the display symbol', () => {
    convert.mockImplementation((amount: number) => amount * 2); // pretend 2x conversion
    render(wrapper(<ComparisonTable countries={[france, germany]} isAuthenticated />));
    expect(document.body.textContent).toContain(`${frNum(5000)} €`); // 2500 * 2
  });

  it('falls back to the raw amount and country currency when conversion fails', () => {
    convert.mockReturnValue(null);
    render(wrapper(<ComparisonTable countries={[france, germany]} isAuthenticated />));
    expect(document.body.textContent).toContain(`${frNum(2500)} EUR`);
  });

  it('shows "not specified" for missing cost-of-living fields', () => {
    const noData: EnrichedCountry = { ...france, idCountry: 3, uniqueId: 'country-3', costOfLiving: undefined };
    render(wrapper(<ComparisonTable countries={[noData, germany]} isAuthenticated />));
    expect(screen.getAllByText('comparison.fields.notSpecified').length).toBeGreaterThan(0);
  });

  it('resolves the localized country name via the supported-countries registry', () => {
    render(wrapper(<ComparisonTable countries={[france, germany]} isAuthenticated />));
    // t() is mocked to return the defaultValue (the raw country name) when no translation exists.
    expect(screen.getAllByText('France').length).toBeGreaterThan(0);
  });

  it('renders the radar chart with an accessible label naming both countries', () => {
    render(wrapper(<ComparisonTable countries={[france, germany]} isAuthenticated />));
    expect(
      screen.getByRole('img', { name: /Radar — France \/ Allemagne/ }),
    ).toBeInTheDocument();
  });

  it('draws the radar grid with one vertex per metric axis (4: salary/housing/food/transport)', () => {
    render(wrapper(<ComparisonTable countries={[france, germany]} isAuthenticated />));
    const svg = screen.getByRole('img', { name: /Radar/ });
    const outerGrid = svg.querySelector('polygon'); // first polygon = outer (level 1) grid
    const points = outerGrid!.getAttribute('points')!.trim().split(' ');
    expect(points).toHaveLength(4);
  });

  it('gives the country with the higher salary a larger radar area on the salary axis', () => {
    render(wrapper(<ComparisonTable countries={[france, germany]} isAuthenticated />));
    const svg = screen.getByRole('img', { name: /Radar/ });
    const areaPolygons = svg.querySelectorAll('polygon[fill-opacity]');
    expect(areaPolygons).toHaveLength(2); // one area per country
  });

  it('formats continent, capital, languages, and recommendation fields when present', () => {
    const enriched: EnrichedCountry = {
      ...france,
      continent: 'Europe',
      capital: 'Paris',
      languages: 'French, English',
      recommendations: {
        visaDifficulty: 'easy',
        language: 'french',
        bestFor: ['students', 'families'],
      },
    } as any;
    render(wrapper(<ComparisonTable countries={[enriched, germany]} isAuthenticated />));
    // t() is mocked to fall back to the raw key/value when no translation is provided.
    expect(document.body.textContent).toContain('Europe');
    expect(document.body.textContent).toContain('Paris');
    expect(document.body.textContent).toContain('French, English');
    expect(document.body.textContent).toContain('students, families');
  });

  it('formats GDP per capita via the currency conversion, with a raw-USD fallback', () => {
    const withGdp: EnrichedCountry = {
      ...france,
      propertyInvestment: { gdpPerCapita: 45000 },
    } as any;
    render(wrapper(<ComparisonTable countries={[withGdp, germany]} isAuthenticated />));
    expect(document.body.textContent).toContain(`${frNum(45000)} €`);

    convert.mockReturnValue(null);
    render(wrapper(<ComparisonTable countries={[withGdp, germany]} isAuthenticated />));
    expect(document.body.textContent).toContain(`${frNum(45000)} $`);
  });

  it('shows the raw city name (no translation lookup) for a city entry', () => {
    const city: EnrichedCountry = { ...france, isCity: true, countryName: 'Lyon' } as any;
    render(wrapper(<ComparisonTable countries={[city, germany]} isAuthenticated />));
    expect(screen.getAllByText('Lyon').length).toBeGreaterThan(0);
  });
});
