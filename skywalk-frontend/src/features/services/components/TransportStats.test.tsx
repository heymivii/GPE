import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import TransportStats from './TransportStats';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
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

function priceRange(avg: number, min = avg - 1, max = avg + 1) {
  return { avg, min, max, currency: 'EUR' };
}

const costOfLivingData = {
  city: { name: 'Paris' },
  currency: { code: 'EUR', exchangeRates: null, lastUpdated: '2026-01-01T00:00:00Z' },
  categories: {
    transportation: {
      publicTransport: { oneWayTicket: priceRange(2), monthlyPass: priceRange(75) },
      taxi: { start: priceRange(4), per1km: priceRange(1.5), waitingHour: priceRange(30) },
      personal: { gasoline1L: priceRange(1.8), newCar: priceRange(25000) },
    },
  },
};

describe('TransportStats', () => {
  beforeEach(() => {
    isSameCurrency.mockReturnValue(true);
    mockedUseQuery.mockReset();
  });

  it('shows a loading state while fetching', () => {
    mockedUseQuery.mockReturnValue({ isLoading: true, isError: false, data: undefined } as any);
    render(<TransportStats countryName="france" />);
    expect(screen.getByText(/services\.stats\.common\.loading/)).toBeInTheDocument();
  });

  it('shows an error state when the query fails', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: true, data: undefined } as any);
    render(<TransportStats countryName="france" />);
    expect(screen.getByText(/services\.stats\.common\.errorLoad/)).toBeInTheDocument();
  });

  it('renders transport figures once data has loaded', () => {
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData } as any);
    render(<TransportStats countryName="france" />);
    expect(screen.getAllByText('Paris').length).toBeGreaterThan(0);
    expect(screen.getByText('services.stats.transport.gasolinePrice')).toBeInTheDocument();
    // Le libellé apparaît désormais deux fois (tuile de stats + titre de section).
    expect(screen.getAllByText('services.stats.transport.publicTransport').length).toBeGreaterThan(0);
  });

  it('shows the currency-conversion badge when the local currency differs from the display currency', () => {
    isSameCurrency.mockReturnValue(false);
    mockedUseQuery.mockReturnValue({ isLoading: false, isError: false, data: costOfLivingData } as any);
    render(<TransportStats countryName="france" />);
    expect(screen.getByText('EUR → EUR')).toBeInTheDocument();
  });
});
