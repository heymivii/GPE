import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DestinationsPage } from './DestinationsPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? k,
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../../api/destinations', () => ({
  destinationsApi: { getAll: vi.fn() },
}));

// La carte charge un topojson monde : inutile (et lourd) pour tester la page.
vi.mock('../components/WorldMap', () => ({
  default: () => <div data-testid="world-map" />,
}));

import { destinationsApi } from '../../../api/destinations';
const mockedGetAll = vi.mocked(destinationsApi.getAll);

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DestinationsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// La carte est la vue par défaut — les assertions sur les cards passent en vue liste.
// Le bouton porte son libellé traduit (defaultValue), pas la clé.
const switchToList = () => fireEvent.click(screen.getByTitle('Vue liste'));

const dest = (overrides: any = {}) => ({
  idCountry: 1,
  countryName: 'France',
  isoCode: 'FR',
  stats: { memberCount: 10, jobOffersCount: 5, forumTopicsCount: 0, resourcesCount: 0 },
  ...overrides,
});

describe('DestinationsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows a loading state', () => {
    mockedGetAll.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    switchToList();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an error state with a retry button', async () => {
    mockedGetAll.mockRejectedValue(new Error('network'));
    renderPage();
    switchToList();
    expect(await screen.findByText('destinationsPage.error')).toBeInTheDocument();
    expect(screen.getByText('destinationsPage.retry')).toBeInTheDocument();
  });

  it('shows the empty state when there are no results', async () => {
    mockedGetAll.mockResolvedValue([]);
    renderPage();
    switchToList();
    expect(await screen.findByText('destinations.noResults.title')).toBeInTheDocument();
  });

  it('renders a card per destination', async () => {
    mockedGetAll.mockResolvedValue([dest({ idCountry: 1, countryName: 'France' }), dest({ idCountry: 2, countryName: 'Allemagne', isoCode: 'DE' })]);
    renderPage();
    switchToList();
    expect(await screen.findByRole('heading', { level: 3, name: 'France' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Allemagne' })).toBeInTheDocument();
  });

  it('filters destinations by search term', async () => {
    mockedGetAll.mockResolvedValue([dest({ idCountry: 1, countryName: 'France' }), dest({ idCountry: 2, countryName: 'Allemagne', isoCode: 'DE' })]);
    renderPage();
    switchToList();
    await screen.findByRole('heading', { level: 3, name: 'France' });

    fireEvent.change(screen.getByPlaceholderText('destinations.searchPlaceholder'), {
      target: { value: 'fra' },
    });
    expect(screen.getByRole('heading', { level: 3, name: 'France' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'Allemagne' })).not.toBeInTheDocument();
  });

  it('sorts destinations by job offers when selected', async () => {
    mockedGetAll.mockResolvedValue([
      dest({ idCountry: 1, countryName: 'France', stats: { memberCount: 1, jobOffersCount: 5, forumTopicsCount: 0, resourcesCount: 0 } }),
      dest({ idCountry: 2, countryName: 'Allemagne', isoCode: 'DE', stats: { memberCount: 1, jobOffersCount: 50, forumTopicsCount: 0, resourcesCount: 0 } }),
    ]);
    renderPage();
    switchToList();
    await screen.findByRole('heading', { level: 3, name: 'France' });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'jobs' } });
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(names[0]).toBe('Allemagne'); // higher jobOffersCount sorts first
  });

  it('shows the world map by default, without the cards grid', async () => {
    mockedGetAll.mockResolvedValue([dest()]);
    renderPage();
    expect(screen.getByTestId('world-map')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'France' })).not.toBeInTheDocument();
  });

  it('switches to the list view when the user types a search', async () => {
    mockedGetAll.mockResolvedValue([dest()]);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('destinations.searchPlaceholder'), {
      target: { value: 'fra' },
    });

    expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 3, name: 'France' })).toBeInTheDocument();
  });

  it('reloads the page when retry is clicked', async () => {
    mockedGetAll.mockRejectedValue(new Error('network'));
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
      configurable: true,
    });
    renderPage();
    switchToList();
    fireEvent.click(await screen.findByText('destinationsPage.retry'));
    expect(reloadSpy).toHaveBeenCalled();
  });
});
