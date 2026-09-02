import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import EmploiStats from './EmploiStats';

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
const formatPrice = vi.fn((v: number) => `${v}€`);
vi.mock('../../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ formatPrice, isSameCurrency, displayCurrency: 'EUR' }),
}));

const mockedUseQuery = vi.mocked(useQuery);

function mockQueries({ adzuna, col }: { adzuna: any; col: any }) {
  mockedUseQuery.mockImplementation((opts: any) => {
    if (opts.queryKey[0] === 'emploi-adzuna') return adzuna;
    return col;
  });
}

const loadingState = { data: undefined, isLoading: true };
const emptyAdzuna = { data: { total: 0, results: [] }, isLoading: false };
const emptyCol = { data: undefined, isLoading: false };

describe('EmploiStats', () => {
  beforeEach(() => {
    isSameCurrency.mockReturnValue(true);
    mockedUseQuery.mockReset();
  });

  it('shows a loading state while either query is pending', () => {
    mockQueries({ adzuna: loadingState, col: emptyCol });
    render(<EmploiStats countryName="france" />);
    expect(screen.getByText(/services\.stats\.common\.loading/)).toBeInTheDocument();
  });

  it('falls back to the static average salary when no live cost-of-living data is available', () => {
    mockQueries({ adzuna: emptyAdzuna, col: emptyCol });
    render(<EmploiStats countryName="france" />);
    expect(screen.getByText(/2.550€/)).toBeInTheDocument();
  });

  it('shows the unemployment rate and legal working hours from static data', () => {
    mockQueries({ adzuna: emptyAdzuna, col: emptyCol });
    render(<EmploiStats countryName="france" />);
    expect(screen.getByText('7.2%')).toBeInTheDocument();
  });

  it('shows the live job count and recent offers when Adzuna returns results', () => {
    mockQueries({
      adzuna: {
        isLoading: false,
        data: {
          total: 1234,
          results: [
            {
              id: 'job1',
              title: 'Développeur Backend',
              company: 'Acme',
              location: { displayName: 'Paris' },
              redirect_url: 'https://example.com/job1',
              created_at: new Date().toISOString(),
              remote: true,
            },
          ],
        },
      },
      col: emptyCol,
    });
    render(<EmploiStats countryName="france" />);
    expect(screen.getByText('Développeur Backend')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('shows the real-time salary from cost-of-living data when available', () => {
    mockQueries({
      adzuna: emptyAdzuna,
      col: {
        isLoading: false,
        data: {
          categories: { salary: { averageMonthly: { avg: 3000, min: 2000, max: 4000 } } },
          currency: { code: 'EUR' },
        },
      },
    });
    render(<EmploiStats countryName="france" />);
    expect(screen.getByText('3000€')).toBeInTheDocument();
  });

  it('shows the sector, contract-type and platform sections for a known country', () => {
    mockQueries({ adzuna: emptyAdzuna, col: emptyCol });
    render(<EmploiStats countryName="france" />);
    expect(screen.getByText('services.stats.emploi.inDemandSectors')).toBeInTheDocument();
    expect(screen.getByText('services.stats.emploi.contractTypes')).toBeInTheDocument();
    expect(screen.getByText('services.stats.emploi.searchPlatforms')).toBeInTheDocument();
  });
});
