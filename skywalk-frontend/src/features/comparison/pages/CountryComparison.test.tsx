import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CountryComparison from './CountryComparison';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.count != null) return `${key}(${opts.count})`;
      return opts?.defaultValue ?? key;
    },
  }),
}));

const dataState: { data: any; isLoading: boolean; error: any } = {
  data: [
    { uniqueId: 'c1', isCity: false, isoCode: 'FR', name: 'France' },
    { uniqueId: 'c2', isCity: false, isoCode: 'DE', name: 'Allemagne' },
    { uniqueId: 'c3', isCity: false, isoCode: 'CH', name: 'Suisse' },
    { uniqueId: 'city1', isCity: true, isoCode: null, name: 'Paris' },
  ],
  isLoading: false,
  error: null,
};
const mockRefetch = vi.fn();
vi.mock('../hooks/useCountriesWithData', () => ({
  useCountriesWithData: () => ({ ...dataState, refetch: mockRefetch }),
}));
vi.mock('../hooks/useComparisonExtras', () => ({
  useComparisonExtras: (selected: any[]) => selected,
}));

const authState: { isAuthenticated: boolean } = { isAuthenticated: false };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated }),
}));

vi.mock('../components/CountrySelector', () => ({
  default: (props: any) => (
    <div data-testid="country-selector">
      {props.countries.map((c: any) => (
        <button key={c.uniqueId} onClick={() => props.onCountryToggle(c.uniqueId)}>
          {c.name}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('../components/ComparisonTable', () => ({
  default: (props: any) => <div data-testid="comparison-table">{props.countries.length} countries</div>,
}));

function renderPage(initialEntries: string[] = ['/comparison']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CountryComparison />
    </MemoryRouter>,
  );
}

describe('CountryComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dataState.isLoading = false;
    dataState.error = null;
    authState.isAuthenticated = false;
  });

  it('shows loading skeletons', () => {
    dataState.isLoading = true;
    const { container } = renderPage();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows an error state with a retry button', () => {
    dataState.error = new Error('boom');
    renderPage();
    fireEvent.click(screen.getByText('Réessayer'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows the empty prompt with a 0/2 counter for an unauthenticated user', () => {
    renderPage();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('comparison.startComparison.title')).toBeInTheDocument();
  });

  it('allows selecting up to maxCountries and shows the table at 2+', () => {
    renderPage();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Allemagne'));
    expect(screen.getByTestId('comparison-table')).toHaveTextContent('2 countries');
  });

  it('shows the auth upsell banner once the free limit is reached', () => {
    renderPage();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Allemagne'));
    expect(screen.getByText('comparison.limitReached.title')).toBeInTheDocument();
  });

  it('does not show the upsell banner for an authenticated user', () => {
    authState.isAuthenticated = true;
    renderPage();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Allemagne'));
    expect(screen.queryByText('comparison.limitReached.title')).not.toBeInTheDocument();
  });

  it('allows a 3rd selection once authenticated', () => {
    authState.isAuthenticated = true;
    renderPage();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Allemagne'));
    fireEvent.click(screen.getByText('Suisse'));
    expect(screen.getByTestId('comparison-table')).toHaveTextContent('3 countries');
  });

  it('resets the selection to a single country when switching between country and city types', () => {
    renderPage();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Paris'));
    // mixed type: selection resets to just the new one (city), so the table isn't shown yet
    expect(screen.queryByTestId('comparison-table')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('France'));
    // still mixed after that -> resets to France alone
    expect(screen.queryByTestId('comparison-table')).not.toBeInTheDocument();
  });

  it('toggles a country off when clicked again', () => {
    renderPage();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Allemagne'));
    fireEvent.click(screen.getByText('France'));
    expect(screen.queryByTestId('comparison-table')).not.toBeInTheDocument();
  });

  it('clears the whole selection via "Tout effacer"', () => {
    renderPage();
    fireEvent.click(screen.getByText('France'));
    fireEvent.click(screen.getByText('Allemagne'));
    fireEvent.click(screen.getByText('Tout effacer'));
    expect(screen.queryByTestId('comparison-table')).not.toBeInTheDocument();
  });

  it('hydrates the selection from the ?ids= URL param', () => {
    renderPage(['/comparison?ids=c1,c2']);
    expect(screen.getByTestId('comparison-table')).toHaveTextContent('2 countries');
  });
});
