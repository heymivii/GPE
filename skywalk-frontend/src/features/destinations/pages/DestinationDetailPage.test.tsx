import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DestinationDetailPage } from './DestinationDetailPage';
import { useAuth } from '../../../hooks/useAuth';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'fr' },
  }),
}));

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));
vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

vi.mock('../components/CostOfLivingTab', () => ({ default: () => <div data-testid="cost-of-living-tab" /> }));
vi.mock('../../../components/AuthPromptCard', () => ({ default: (p: any) => <div data-testid="auth-prompt-card">{p.title}</div> }));

vi.mock('../../../data/blog-data', () => ({
  getArticlesByCountry: vi.fn(() => []),
  getArticleTranslation: (_id: string, field: string) => `article-${field}`,
  getCategoryTranslation: () => 'category',
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseAuth = vi.mocked(useAuth);

const country = {
  idCountry: 1,
  countryName: 'Canada',
  isoCode: 'CA',
  currency: 'CAD',
  continent: { name: 'north-america' },
  cities: [{ city_id: 1, name: 'Montréal', description: null, imageUrl: null }],
  stats: { memberCount: 1500, jobOffersCount: 42, forumTopicsCount: 8 },
  costOfLiving: { averageHousing: '1200', currency: 'CAD' },
};

function setup({
  isLoading = false,
  isError = false,
  countryData = country,
  isAuthenticated = false,
  jobsData = undefined as any,
  topics = [] as any[],
  migrationData = undefined as any,
}: any = {}) {
  mockedUseAuth.mockReturnValue({ isAuthenticated } as any);
  mockedUseQuery.mockImplementation((opts: any) => {
    const key = opts.queryKey[0];
    if (key === 'destination-detail') return { data: countryData, isLoading, isError } as any;
    if (key === 'destination-jobs-preview') return { data: jobsData } as any;
    if (key === 'forum-topics') return { data: topics } as any;
    if (key === 'oecd-migration') return { data: migrationData } as any;
    return { data: undefined } as any;
  });
}

function renderPage(path = '/destinations/canada') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/destinations/:countrySlug" element={<DestinationDetailPage />} />
        <Route path="/destinations" element={<div>Destinations list</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DestinationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner', () => {
    setup({ isLoading: true, countryData: undefined });
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('redirects to the destinations list on error', () => {
    setup({ isError: true, countryData: undefined });
    renderPage();
    expect(screen.getByText('Destinations list')).toBeInTheDocument();
  });

  it('renders the country header and stats', () => {
    setup();
    renderPage();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('1.5k')).toBeInTheDocument();
  });

  it('shows the overview tab by default', () => {
    setup();
    renderPage();
    expect(screen.getByText('services.destinationDetail.about')).toBeInTheDocument();
  });

  it('switches to the cities tab and lists the cities', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.cities'));
    expect(screen.getByText('Montréal')).toBeInTheDocument();
  });

  it('shows a premium CTA for cost-of-living when logged out', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.costOfLiving'));
    expect(screen.getByText('services.destinationDetail.premiumContent')).toBeInTheDocument();
    expect(screen.queryByTestId('cost-of-living-tab')).not.toBeInTheDocument();
  });

  it('shows the cost-of-living tab when authenticated', () => {
    setup({ isAuthenticated: true });
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.costOfLiving'));
    expect(screen.getByTestId('cost-of-living-tab')).toBeInTheDocument();
  });

  it('shows a premium CTA for opportunities when logged out', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.opportunities'));
    expect(screen.getByText('services.destinationDetail.premiumContent')).toBeInTheDocument();
  });

  it('lists job opportunities when authenticated', () => {
    setup({
      isAuthenticated: true,
      jobsData: { total: 2, results: [{ id: 1, title: 'Dev', company: 'Acme', location: { displayName: 'Montréal' }, redirect_url: 'https://x', created_at: '2026-01-01T00:00:00Z' }] },
    });
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.opportunities'));
    expect(screen.getByText('Dev')).toBeInTheDocument();
  });

  it('shows a no-offers state when authenticated with no jobs', () => {
    setup({ isAuthenticated: true, jobsData: { total: 0, results: [] } });
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.opportunities'));
    expect(screen.getByText('services.destinationDetail.noOffers')).toBeInTheDocument();
  });

  it('shows forum topics for the country', () => {
    setup({
      topics: [
        { topic_id: 1, title: 'Bienvenue', country: { idCountry: 1 }, created_at: '2026-01-01T00:00:00Z', user: { fullName: 'Alice' } },
        { topic_id: 2, title: 'Autre pays', country: { idCountry: 2 }, created_at: '2026-01-01T00:00:00Z' },
      ],
    });
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.forum'));
    expect(screen.getByText('Bienvenue')).toBeInTheDocument();
    expect(screen.queryByText('Autre pays')).not.toBeInTheDocument();
  });

  it('shows an empty forum state when there are no topics for the country', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.forum'));
    expect(screen.getByText(/services\.destinationDetail\.noTopics/)).toBeInTheDocument();
  });

  it('shows a premium CTA for resources when logged out', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.resources'));
    expect(screen.getByText('services.destinationDetail.premiumContent')).toBeInTheDocument();
  });

  it('shows an empty resources state when authenticated with no articles', () => {
    setup({ isAuthenticated: true });
    renderPage();
    fireEvent.click(screen.getByText('services.destinationDetail.resources'));
    expect(screen.getByText(/services\.destinationDetail\.noResources/)).toBeInTheDocument();
  });

  it('shows migration stats when authenticated and data is available', () => {
    setup({
      isAuthenticated: true,
      migrationData: { stocksForeignPop: { value: 8000000, year: 2023 } },
    });
    renderPage();
    expect(screen.getByText('services.destinationDetail.migrationStats.title')).toBeInTheDocument();
    expect(screen.getByText(/8.*000.*000/)).toBeInTheDocument();
  });

  it('shows a premium migration CTA when logged out and data exists', () => {
    setup({ migrationData: { stocksForeignPop: { value: 8000000, year: 2023 } } });
    renderPage();
    expect(screen.getByText('services.destinationDetail.premiumMigration')).toBeInTheDocument();
  });

  it('shows the AuthPromptCard sidebar when logged out', () => {
    setup();
    renderPage();
    expect(screen.getByTestId('auth-prompt-card')).toBeInTheDocument();
  });

  it('hides the AuthPromptCard sidebar when logged in', () => {
    setup({ isAuthenticated: true });
    renderPage();
    expect(screen.queryByTestId('auth-prompt-card')).not.toBeInTheDocument();
  });
});
