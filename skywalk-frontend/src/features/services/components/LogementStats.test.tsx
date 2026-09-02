import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import LogementStats from './LogementStats';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const isSameCurrency = vi.fn(() => true);
const formatPrice = vi.fn((v: number | undefined) => (v == null ? '—' : `${v}€`));
vi.mock('../../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    formatPrice,
    isSameCurrency,
    displayCurrency: 'EUR',
    displaySymbol: '€',
  }),
}));

const mockedUseQuery = vi.mocked(useQuery);

function priceRange(avg: number, min = avg - 100, max = avg + 100) {
  return { avg, min, max, currency: 'EUR' };
}

function costOfLivingData(overrides: any = {}) {
  return {
    city: { name: 'Paris' },
    currency: { code: 'EUR', lastUpdated: '2026-01-01T00:00:00Z' },
    categories: {
      housing: {
        rent: {
          oneBedroom: { cityCenter: priceRange(1200), outsideCenter: priceRange(900) },
          threeBedroom: { cityCenter: priceRange(2200), outsideCenter: priceRange(1700) },
        },
        buy: { pricePerSqm: { cityCenter: priceRange(11000), outsideCenter: priceRange(7000) } },
      },
      utilities: { basic85m2: priceRange(180), internet: priceRange(30) },
      salary: { averageMonthly: { avg: 2500 } },
    },
    ...overrides,
  };
}

describe('LogementStats', () => {
  beforeEach(() => {
    isSameCurrency.mockReturnValue(true);
    mockedUseQuery.mockReset();
  });

  it('shows a loading state while fetching', () => {
    mockedUseQuery.mockReturnValue({ isLoading: true, isError: false, data: undefined } as any);
    render(<LogementStats countryName="france" />);
    expect(screen.getByText(/services\.stats\.common\.loading/)).toBeInTheDocument();
  });

  it('shows an error state when the query fails', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: true, data: undefined } as any);
    render(<LogementStats countryName="france" />);
    expect(screen.getByText(/services\.stats\.common\.errorLoad/)).toBeInTheDocument();
  });

  it('renders headline rent figures once data has loaded', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<LogementStats countryName="france" />);
    expect(screen.getAllByText('services.stats.logement.rent1bedroom').length).toBeGreaterThan(0);
    expect(screen.getByText('services.stats.logement.monthlyRents')).toBeInTheDocument();
  });

  it('shows the salary context banner with the rent-to-salary ratio when salary data exists', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<LogementStats countryName="france" />);
    // rent1BCenter 1200 / salary 2500 = 48%
    expect(screen.getByText(/services\.stats\.logement\.rentPercentOfSalary:\{"pct":48\}/)).toBeInTheDocument();
  });

  it('hides the salary context banner when there is no salary data', () => {
    mockedUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: costOfLivingData({ categories: { ...costOfLivingData().categories, salary: { averageMonthly: { avg: 0 } } } }),
    } as any);
    render(<LogementStats countryName="france" />);
    expect(screen.queryByText('services.stats.logement.salaryContext')).not.toBeInTheDocument();
  });

  it('shows the currency-conversion badge when currencies differ', () => {
    isSameCurrency.mockReturnValue(false);
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<LogementStats countryName="france" />);
    expect(screen.getByText('EUR → EUR')).toBeInTheDocument();
  });
});
