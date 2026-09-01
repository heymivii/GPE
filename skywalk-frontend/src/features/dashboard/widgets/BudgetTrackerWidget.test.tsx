import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BudgetTrackerWidget from './BudgetTrackerWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.destination) return `subtitle-${opts.destination}`;
      if (opts?.percentage != null) return `${opts.percentage}%`;
      if (opts?.price != null) return `${opts.price} ${opts.currency}`;
      if (opts?.city != null) return `live-${opts.city}`;
      return key.split('.').pop() ?? key;
    },
  }),
}));

vi.mock('../../../api/costOfLiving', () => ({
  costOfLivingApi: { getCostOfLiving: vi.fn() },
}));

import { costOfLivingApi } from '../../../api/costOfLiving';
const mockedGetCol = vi.mocked(costOfLivingApi.getCostOfLiving);

function wrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

function renderWidget(props: Partial<React.ComponentProps<typeof BudgetTrackerWidget>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<BudgetTrackerWidget housingBudget="1000" {...props} />, { wrapper: wrapper(qc) });
}

describe('BudgetTrackerWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    mockedGetCol.mockReturnValue(new Promise(() => {})); // never resolves unless overridden
  });

  it('shows the budget with no conversion line when origin and destination share a currency', () => {
    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'EUR' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'EUR' } as any,
    });
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument();
  });

  it('converts and displays the budget in the destination currency', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ usd: { gbp: 0.8 } }),
    });
    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'USD' } as any,
      countryData: { code: 'GB', name: 'UK', currency: 'GBP' } as any,
    });

    await waitFor(() => expect(screen.getByText(/≈ 800 GBP/)).toBeInTheDocument());
  });

  it('shows the no-data fallback when there is no cost-of-living info at all', () => {
    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'EUR' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'EUR' } as any,
    });
    expect(screen.getByText('message')).toBeInTheDocument(); // t() returns the last key segment
  });

  it('uses static cost-of-living data and shows the "covered" label at full coverage', () => {
    renderWidget({
      housingBudget: '2000',
      originCountryData: { currency: 'EUR' } as any,
      countryData: {
        code: 'ZZ',
        name: 'Nowhere',
        currency: 'EUR',
        costOfLiving: { averageRent: { oneBedroom: 1000, threeBedroom: 2500 }, averageSalary: 0 },
      } as any,
    });
    expect(screen.getByText('covered')).toBeInTheDocument(); // 1BR: 2000/1000 = 100%+
    expect(screen.getByText('sourceStatic')).toBeInTheDocument();
  });

  it('shows a percentage coverage label when the budget does not fully cover the rent', () => {
    renderWidget({
      housingBudget: '500',
      originCountryData: { currency: 'EUR' } as any,
      countryData: {
        code: 'ZZ',
        name: 'Nowhere',
        currency: 'EUR',
        costOfLiving: { averageRent: { oneBedroom: 1000, threeBedroom: 2500 }, averageSalary: 0 },
      } as any,
    });
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('prefers live cost-of-living data over the static fallback, labeling the source', async () => {
    mockedGetCol.mockResolvedValue({
      currency: { code: 'EUR' },
      categories: {
        housing: {
          rent: {
            oneBedroom: { cityCenter: { avg: 900 } },
            threeBedroom: { cityCenter: { avg: 1800 } },
          },
        },
      },
      summary: { averageSalary: 3000 },
    } as any);

    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'EUR' } as any,
      countryData: {
        code: 'FR',
        name: 'France',
        currency: 'EUR',
        costOfLiving: { averageRent: { oneBedroom: 1, threeBedroom: 1 }, averageSalary: 1 },
      } as any,
    });

    await waitFor(() => expect(screen.getByText('live-Paris')).toBeInTheDocument());
    expect(screen.getByText(/3,000 EUR/)).toBeInTheDocument();
  });

  it('falls back to the project city name over the country capital when fetching live data', async () => {
    mockedGetCol.mockResolvedValue({
      currency: { code: 'EUR' },
      categories: { housing: { rent: { oneBedroom: { cityCenter: {} }, threeBedroom: { cityCenter: {} } } } },
      summary: {},
    } as any);

    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'EUR' } as any,
      countryData: { code: 'FR', name: 'France', currency: 'EUR' } as any,
      cityName: 'Lyon',
    });

    await waitFor(() => expect(mockedGetCol).toHaveBeenCalledWith('Lyon', 'France'));
  });

  it('shows the "excellent" advice when the budget covers the 3-bedroom rent', () => {
    renderWidget({
      housingBudget: '3000',
      originCountryData: { currency: 'EUR' } as any,
      countryData: {
        code: 'ZZ',
        name: 'Nowhere',
        currency: 'EUR',
        costOfLiving: { averageRent: { oneBedroom: 1000, threeBedroom: 2000 } },
      } as any,
    });
    expect(screen.getByText('excellent')).toBeInTheDocument();
  });

  it('shows the "tight" advice when the budget covers neither apartment size', () => {
    renderWidget({
      housingBudget: '500',
      originCountryData: { currency: 'EUR' } as any,
      countryData: {
        code: 'ZZ',
        name: 'Nowhere',
        currency: 'EUR',
        costOfLiving: { averageRent: { oneBedroom: 1000, threeBedroom: 2000 } },
      } as any,
    });
    expect(screen.getByText('tight')).toBeInTheDocument();
  });

  it('shows no conversion line when the exchange rate API responds not-ok', async () => {
    (fetch as any).mockResolvedValue({ ok: false });
    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'AAA' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'BBB' } as any,
    });
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument();
  });

  it('shows no conversion line when the API response has no matching rate', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ ccc: {} }) });
    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'CCC' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'DDD' } as any,
    });
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument();
  });

  it('shows no conversion line when the exchange rate fetch throws', async () => {
    (fetch as any).mockRejectedValue(new Error('network down'));
    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'EEE' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'FFF' } as any,
    });
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument();
  });

  it('caches the exchange rate and does not refetch within the TTL for the same pair', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ ggg: { hhh: 2 } }) });
    const { unmount } = renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'GGG' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'HHH' } as any,
    });
    await waitFor(() => expect(screen.getByText(/≈ 2,000 HHH/)).toBeInTheDocument());
    const callsAfterFirstRender = (fetch as any).mock.calls.length;
    unmount();

    renderWidget({
      housingBudget: '500',
      originCountryData: { currency: 'GGG' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'HHH' } as any,
    });
    await waitFor(() => expect(screen.getByText(/≈ 1,000 HHH/)).toBeInTheDocument());
    // Second render reuses the module-level cache for this GGG→HHH pair — no new fetch calls.
    expect((fetch as any).mock.calls.length).toBe(callsAfterFirstRender);
  });

  it('quick converter: updates the amount and currency selects', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });
    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'EUR' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'EUR' } as any,
    });

    const amountInput = screen.getByLabelText('amount');
    fireEvent.change(amountInput, { target: { value: '50' } });
    expect((amountInput as HTMLInputElement).value).toBe('50');

    const [fromSelect, toSelect] = screen.getAllByRole('combobox');
    fireEvent.change(fromSelect, { target: { value: 'USD' } });
    fireEvent.change(toSelect, { target: { value: 'GBP' } });
    expect((fromSelect as HTMLSelectElement).value).toBe('USD');
    expect((toSelect as HTMLSelectElement).value).toBe('GBP');
  });

  it('quick converter: defaults to a 1:1 result when the two currencies match', () => {
    renderWidget({
      housingBudget: '1000',
      originCountryData: { currency: 'EUR' } as any,
      countryData: { code: 'ZZ', name: 'Nowhere', currency: 'EUR' } as any,
    });
    // origin=EUR, destCurrency defaults to EUR (liveCurrency fallback) => convFrom===convTo => rate 1
    expect(screen.getByText(/^100 EUR$/)).toBeInTheDocument();
  });
});
