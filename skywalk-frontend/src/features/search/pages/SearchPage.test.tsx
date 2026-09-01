import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchPage from './SearchPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.count != null) return `${key}(${opts.count})`;
      return key;
    },
  }),
}));

const authState: { isAuthenticated: boolean } = { isAuthenticated: false };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated }),
}));

const mockUpdateFilters = vi.fn();
const mockSearch = vi.fn();
const mockLoadMore = vi.fn();
const searchState: any = {
  filters: {
    query: '',
    category: '',
    country: '',
    city: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
  },
  results: [],
  isLoading: false,
  totalResults: 0,
  hasMore: false,
};
vi.mock('../hooks/useSearch', () => ({
  default: () => ({
    ...searchState,
    updateFilters: mockUpdateFilters,
    search: mockSearch,
    loadMore: mockLoadMore,
  }),
}));

vi.mock('../components/SearchBar', () => ({
  default: (p: any) => (
    <input
      data-testid="search-bar"
      defaultValue={p.initialQuery}
      onChange={(e) => p.onSearch(e.target.value)}
    />
  ),
}));
vi.mock('../components/FilterSection', () => ({
  default: () => <div data-testid="filter-section" />,
}));
vi.mock('../components/ResultsSection', () => ({
  default: (p: any) => <div data-testid="results-section">{p.results.length} results</div>,
}));
vi.mock('../components/InfiniteScrollTrigger', () => ({
  default: () => <div data-testid="infinite-scroll" />,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <SearchPage />
    </MemoryRouter>,
  );
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authState.isAuthenticated = false;
    searchState.filters = { query: '', category: '', country: '', city: '', sortBy: 'relevance', sortOrder: 'desc' };
    searchState.results = [];
    searchState.isLoading = false;
    searchState.totalResults = 0;
    searchState.hasMore = false;
  });

  it('runs an initial search on mount when there is no onboarding data or URL filters', () => {
    renderPage();
    expect(mockSearch).toHaveBeenCalled();
  });

  it('seeds filters from the onboarding data in localStorage', () => {
    localStorage.setItem(
      'skywalk-onboarding-data',
      JSON.stringify({ destination: { country: 'France', city: 'Paris' }, needs: { priorities: ['housing'] } }),
    );
    renderPage();
    expect(mockUpdateFilters).toHaveBeenCalledWith({ country: 'France', city: 'Paris', category: 'logement' });
  });

  it('seeds the employment category when that priority is present', () => {
    localStorage.setItem(
      'skywalk-onboarding-data',
      JSON.stringify({ destination: {}, needs: { priorities: ['employment'] } }),
    );
    renderPage();
    expect(mockUpdateFilters).toHaveBeenCalledWith({ category: 'emploi' });
  });

  it('shows the popular-destinations heading and quick filter chips with no active filters', () => {
    renderPage();
    expect(screen.getByText('searchPage.popularDestinations')).toBeInTheDocument();
    fireEvent.click(screen.getByText('🇫🇷 searchPage.france'));
    expect(mockUpdateFilters).toHaveBeenCalledWith({ country: 'France' });
  });

  it('shows the search-results heading when a query is active', () => {
    searchState.filters.query = 'developer';
    renderPage();
    expect(screen.getByText('searchPage.searchResults')).toBeInTheDocument();
    expect(screen.queryByText('searchPage.popularDestinations')).not.toBeInTheDocument();
  });

  it('shows the result count when totalResults > 0', () => {
    searchState.totalResults = 5;
    renderPage();
    expect(screen.getByText('searchPage.resultCount(5)')).toBeInTheDocument();
  });

  it('toggles the filter panel', () => {
    renderPage();
    expect(screen.queryByTestId('filter-section')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('searchPage.filters'));
    expect(screen.getByTestId('filter-section')).toBeInTheDocument();
  });

  it('changes the sort order', () => {
    renderPage();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'date-asc' } });
    expect(mockUpdateFilters).toHaveBeenCalledWith({ sortBy: 'date', sortOrder: 'asc' });
  });

  it('performs a text search via the search bar', () => {
    renderPage();
    fireEvent.change(screen.getByTestId('search-bar'), { target: { value: 'react dev' } });
    expect(mockUpdateFilters).toHaveBeenCalledWith({ query: 'react dev' });
  });

  it('slices results to 10 and shows the upsell banner when unauthenticated', () => {
    searchState.results = Array.from({ length: 15 }, (_, i) => ({ id: i }));
    renderPage();
    expect(screen.getByTestId('results-section')).toHaveTextContent('10 results');
    expect(screen.getByText('searchPage.discoverMore(5)')).toBeInTheDocument();
  });

  it('shows all results without the upsell banner when authenticated', () => {
    authState.isAuthenticated = true;
    searchState.results = Array.from({ length: 15 }, (_, i) => ({ id: i }));
    renderPage();
    expect(screen.getByTestId('results-section')).toHaveTextContent('15 results');
    expect(screen.queryByText(/searchPage.discoverMore/)).not.toBeInTheDocument();
  });

  it('shows the infinite-scroll trigger only when authenticated and filtering by jobs', () => {
    authState.isAuthenticated = true;
    searchState.filters.category = 'emploi';
    renderPage();
    expect(screen.getByTestId('infinite-scroll')).toBeInTheDocument();
  });

  it('shows a no-results state with a reset button when a query yields nothing', () => {
    searchState.filters.query = 'zzz';
    searchState.results = [];
    renderPage();
    expect(screen.getByText('searchPage.noResults')).toBeInTheDocument();
    fireEvent.click(screen.getByText('searchPage.resetFilters'));
    expect(mockUpdateFilters).toHaveBeenCalledWith(
      expect.objectContaining({ query: '', category: '', country: '', city: '' }),
    );
    expect(mockSearch).toHaveBeenCalledTimes(2); // initial mount + reset
  });

  it('switches between grid and list view modes', () => {
    searchState.filters.query = 'x'; // hides the quick-filter chips so only 3 buttons remain
    renderPage();
    const buttons = screen.getAllByRole('button');
    const gridBtn = buttons[1];
    const listBtn = buttons[2];
    expect(gridBtn.className).toContain('bg-white');
    fireEvent.click(listBtn);
    expect(listBtn.className).toContain('bg-white');
  });
});
