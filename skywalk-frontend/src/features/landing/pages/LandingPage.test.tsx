import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './LandingPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
  }),
}));

const authState: { isAuthenticated: boolean } = { isAuthenticated: false };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated }),
}));

const mockGetActive = vi.fn();
vi.mock('../../../api/country', () => ({
  countryApi: { getActive: (...args: any[]) => mockGetActive(...args) },
}));

vi.mock('../../dashboard/components/DestinationCard', () => ({
  default: (props: any) => <div data-testid="destination-card">{props.countryName}</div>,
}));
vi.mock('../components/VisaChecker', () => ({ default: () => <div data-testid="visa-checker" /> }));
vi.mock('../components/LandingToolsSection', () => ({ default: () => <div data-testid="tools-section" /> }));
vi.mock('../components/MiddleCtaBanner', () => ({ default: () => <div data-testid="middle-cta" /> }));
vi.mock('../components/NewsletterCTA', () => ({ default: () => <div data-testid="newsletter-cta" /> }));
vi.mock('../components/HowItWorks', () => ({ default: () => <div data-testid="how-it-works" /> }));
vi.mock('../components/DestinationPreview', () => ({ default: () => <div data-testid="destination-preview" /> }));
vi.mock('../components/Testimonials', () => ({ default: () => <div data-testid="testimonials" /> }));
vi.mock('../components/FAQ', () => ({ default: () => <div data-testid="faq" /> }));
vi.mock('../components/OfficialSources', () => ({ default: () => <div data-testid="official-sources" /> }));
vi.mock('../components/Pricing', () => ({ default: () => <div data-testid="pricing" /> }));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    mockGetActive.mockResolvedValue([]);
  });

  it('renders all landing sections', async () => {
    renderPage();
    expect(screen.getByTestId('visa-checker')).toBeInTheDocument();
    expect(screen.getByTestId('destination-preview')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
    expect(screen.getByTestId('official-sources')).toBeInTheDocument();
    expect(screen.getByTestId('tools-section')).toBeInTheDocument();
    expect(screen.getByTestId('middle-cta')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials')).toBeInTheDocument();
    expect(screen.getByTestId('pricing')).toBeInTheDocument();
    expect(screen.getByTestId('newsletter-cta')).toBeInTheDocument();
    expect(screen.getByTestId('faq')).toBeInTheDocument();
    expect(screen.getAllByTestId('destination-card')).toHaveLength(3);
  });

  it('shows a dash placeholder when the active-destination count is not yet loaded', () => {
    mockGetActive.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows the count of selectable-as-destination active countries', async () => {
    mockGetActive.mockResolvedValue([
      { selectableAsDestination: true },
      { selectableAsDestination: true },
      { selectableAsDestination: false },
    ]);
    renderPage();
    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  it('links the hero CTA to the onboarding auth flow when unauthenticated', () => {
    renderPage();
    expect(screen.getByText('landing.hero.cta').closest('a')).toHaveAttribute(
      'href',
      '/auth/register?redirect=/onboarding',
    );
  });

  it('links the hero CTA straight to onboarding when authenticated', () => {
    authState.isAuthenticated = true;
    renderPage();
    expect(screen.getByText('landing.hero.cta').closest('a')).toHaveAttribute('href', '/onboarding');
  });

  it('links each popular destination card to its country page', () => {
    renderPage();
    const cards = screen.getAllByTestId('destination-card');
    expect(cards[0].closest('a')).toHaveAttribute('href', '/destinations/JP');
    expect(cards[1].closest('a')).toHaveAttribute('href', '/destinations/US');
    expect(cards[2].closest('a')).toHaveAttribute('href', '/destinations/CH');
  });

  it('links the "view all" button to the destinations page', () => {
    renderPage();
    expect(screen.getByText('landing.destinations.viewAll').closest('a')).toHaveAttribute('href', '/destinations');
  });
});
