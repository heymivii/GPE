import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ServicePage from './ServicePage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.country) return `${key}(${opts.country})`;
      if (opts?.category) return `${key}(${opts.category})`;
      return key;
    },
  }),
}));

const serviceState: { service: any } = {
  service: {
    id: 'logement',
    title: 'Logement',
    subtitle: 'sub',
    description: 'desc',
    icon: () => null,
    color: 'blue',
    bgColor: 'bg-blue',
    guides: [{ id: 'g1' }],
    tips: ['tip1'],
    stats: [{ label: 'Loyer', value: '1000€' }],
    searchCategory: 'logement',
  },
};
vi.mock('../../../data/services-config', () => ({
  getServiceBySlug: (slug: string) => (slug === 'unknown' ? undefined : serviceState.service),
}));

const contentState: any = {
  content: { hasCountryContent: false, stats: [], guides: [], tips: [] },
  selectedCountry: null,
  setSelectedCountry: vi.fn(),
  selectedCity: null,
  setSelectedCity: vi.fn(),
  availableCities: [],
  displayMode: 'generic',
  isAuthenticated: false,
};
vi.mock('../hooks/useServiceContent', () => ({
  useServiceContent: () => contentState,
}));

const govLinkState: { link: any } = { link: undefined };
vi.mock('../../../api/useGovLink', () => ({
  useGovLink: () => ({ link: govLinkState.link, isLoading: false }),
}));

vi.mock('../components/ServiceGuides', () => ({ default: (p: any) => <div data-testid="service-guides">{p.guides.length} guides</div> }));
vi.mock('../components/ServiceStats', () => ({ default: (p: any) => <div data-testid="service-stats">{p.stats.length} stats</div> }));
vi.mock('../components/ServiceResults', () => ({ default: (p: any) => <div data-testid="service-results">{p.title}</div> }));
vi.mock('../components/CountrySelector', () => ({ default: (p: any) => <button onClick={() => p.onCountryChange('france')}>country-selector</button> }));
vi.mock('../components/CitySelector', () => ({ default: () => <div data-testid="city-selector" /> }));
vi.mock('../components/ServiceTools', () => ({ default: () => <div data-testid="service-tools" /> }));
vi.mock('../components/HealthStats', () => ({ default: (p: any) => <div data-testid="health-stats">{p.countryName}</div> }));
vi.mock('../components/TransportStats', () => ({ default: (p: any) => <div data-testid="transport-stats">{p.countryName}</div> }));
vi.mock('../components/LogementStats', () => ({ default: (p: any) => <div data-testid="logement-stats">{p.countryName}</div> }));
vi.mock('../components/EmploiStats', () => ({ default: (p: any) => <div data-testid="emploi-stats">{p.countryName}</div> }));
vi.mock('../components/VisaStats', () => ({ default: (p: any) => <div data-testid="visa-stats">{p.countryName}</div> }));
vi.mock('../../../components/OfficialLinkCard', () => ({ default: (p: any) => <div data-testid="official-link">{p.label}</div> }));

function renderAt(category: string) {
  return render(
    <MemoryRouter initialEntries={[`/services/${category}`]}>
      <Routes>
        <Route path="/services/:category" element={<ServicePage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ServicePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contentState.content = { hasCountryContent: false, stats: [], guides: [], tips: [] };
    contentState.selectedCountry = null;
    contentState.selectedCity = null;
    contentState.availableCities = [];
    contentState.displayMode = 'generic';
    contentState.isAuthenticated = false;
    govLinkState.link = undefined;
  });

  it('shows the not-found state for an unknown service and links back home', () => {
    renderAt('unknown');
    expect(screen.getByText('services.servicePage.notFound.title')).toBeInTheDocument();
    fireEvent.click(screen.getByText('services.servicePage.notFound.backHome'));
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders the discovery banner in generic mode for an unauthenticated user', () => {
    renderAt('logement');
    expect(screen.getByText('services.servicePage.modes.discovery.title')).toBeInTheDocument();
    expect(screen.getByText('services.servicePage.modes.discovery.cta')).toBeInTheDocument();
  });

  it('renders the personalized banner with country when a project exists', () => {
    contentState.displayMode = 'with-project';
    contentState.content = { hasCountryContent: true, stats: [], guides: [], tips: [] };
    contentState.selectedCountry = 'france';
    renderAt('logement');
    expect(screen.getByText('services.servicePage.modes.personalized.titleWithCountry(france)')).toBeInTheDocument();
  });

  it('renders the exploration banner without a project', () => {
    contentState.displayMode = 'without-project';
    renderAt('logement');
    expect(screen.getByText('services.servicePage.modes.exploration.title')).toBeInTheDocument();
  });

  it('shows the country/city selectors and sidebar tools only when authenticated', () => {
    contentState.isAuthenticated = true;
    contentState.availableCities = [{ slug: 'paris', name: 'Paris' }, { slug: 'lyon', name: 'Lyon' }];
    renderAt('logement');
    expect(screen.getByText('country-selector')).toBeInTheDocument();
    expect(screen.getByTestId('city-selector')).toBeInTheDocument();
    expect(screen.getByTestId('service-tools')).toBeInTheDocument();
  });

  it('renders the category-specific stats widget when a country is selected', () => {
    contentState.selectedCountry = 'france';
    renderAt('logement');
    expect(screen.getByTestId('logement-stats')).toHaveTextContent('france');
  });

  it('falls back to generic ServiceStats when no country is selected', () => {
    contentState.content = { hasCountryContent: false, stats: [{ label: 'Loyer', value: '1000€' }], guides: [], tips: [] };
    renderAt('logement');
    expect(screen.getByTestId('service-stats')).toHaveTextContent('1 stats');
  });

  it('renders the official gov link card when available', () => {
    govLinkState.link = { label: 'Service Public', url: 'https://x', verifiedAt: '2026-01-01', summary: 'sum' };
    renderAt('logement');
    expect(screen.getByTestId('official-link')).toHaveTextContent('Service Public');
  });

  it('renders ServiceResults when the service has a searchCategory', () => {
    renderAt('logement');
    expect(screen.getByTestId('service-results')).toHaveTextContent('Logement');
  });

  it('renders guides and tips', () => {
    contentState.content = { hasCountryContent: false, stats: [], guides: [{ id: 'g1' }], tips: ['tip1'] };
    renderAt('logement');
    expect(screen.getByTestId('service-guides')).toHaveTextContent('1 guides');
  });
});
