import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import HealthStats from './HealthStats';

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

function costOfLivingData(overrides: any = {}) {
  return {
    city: { name: 'Paris' },
    currency: { code: 'EUR', lastUpdated: '2026-01-01T00:00:00Z' },
    summary: { monthlyBudget: { avg: 1500 }, averageSalary: 2500 },
    categories: { childcare: { preschool: { avg: 400 } } },
    ...overrides,
  };
}

describe('HealthStats', () => {
  beforeEach(() => {
    isSameCurrency.mockReturnValue(true);
    mockedUseQuery.mockReset();
  });

  it('shows a loading state while fetching', () => {
    mockedUseQuery.mockReturnValue({ isLoading: true, isError: false, data: undefined } as any);
    render(<HealthStats countryName="france" />);
    expect(screen.getByText(/services\.stats\.common\.loading/)).toBeInTheDocument();
  });

  it('shows an error state when the query fails', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: true, data: undefined } as any);
    render(<HealthStats countryName="france" />);
    expect(screen.getByText(/services\.stats\.common\.errorLoad/)).toBeInTheDocument();
  });

  it('shows the French system as covered "via taxes" with no direct insurance cost', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<HealthStats countryName="france" />);
    expect(screen.getByText('services.stats.health.viaTaxes')).toBeInTheDocument();
    expect(screen.getByText('healthMeta.france.alertTitle')).toBeInTheDocument();
  });

  it('shows the US alert and health-insurance label for the United States', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<HealthStats countryName="etats-unis" />);
    expect(screen.getByText('healthMeta.usa.alertTitle')).toBeInTheDocument();
    expect(screen.getByText('services.stats.health.healthInsurance')).toBeInTheDocument();
  });

  it('shows the Swiss LAMal label for Switzerland', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<HealthStats countryName="suisse" />);
    expect(screen.getByText('services.stats.health.primeLAMal')).toBeInTheDocument();
  });

  it('falls back to the France health profile for an unsupported country', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<HealthStats countryName="atlantide" />);
    expect(screen.getByText('healthMeta.france.alertTitle')).toBeInTheDocument();
  });

  it('computes the health-cost-to-salary ratio', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<HealthStats countryName="etats-unis" />);
    // insurance 450 / salary 2500 = 18%
    expect(screen.getByText('services.stats.health.ofAverageSalary:{"pct":18}')).toBeInTheDocument();
  });

  it('shows the currency-conversion badge when currencies differ', () => {
    isSameCurrency.mockReturnValue(false);
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData() } as any);
    render(<HealthStats countryName="france" />);
    expect(screen.getByText('EUR → EUR')).toBeInTheDocument();
  });
});
