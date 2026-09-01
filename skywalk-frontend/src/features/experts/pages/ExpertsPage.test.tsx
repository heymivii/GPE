import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExpertsPage from './ExpertsPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.count != null) return `${opts.count} avis`;
      return opts?.defaultValue ?? key;
    },
  }),
}));

const useExpertsState: { data: any[]; isLoading: boolean } = { data: [], isLoading: false };
vi.mock('../../../hooks/useExperts', () => ({
  useExperts: (...args: any[]) => {
    mockedUseExperts(...args);
    return useExpertsState;
  },
}));
const mockedUseExperts = vi.fn();

const authState: { user: any } = { user: null };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: authState.user }),
}));

vi.mock('../../../api/country', () => ({
  countryApi: { getActive: vi.fn().mockResolvedValue([{ idCountry: 1, countryName: 'France' }]) },
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ExpertsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const expert = (overrides: any = {}) => ({
  idUser: 1,
  fullName: 'Jean Dupont',
  expertTitle: 'Avocat en immigration',
  expertBio: 'Spécialiste des visas de travail.',
  averageRating: 4.5,
  ratingCount: 3,
  expertCountry: { countryName: 'France' },
  ...overrides,
});

describe('ExpertsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
    useExpertsState.data = [];
    useExpertsState.isLoading = false;
  });

  it('shows a loading spinner', () => {
    useExpertsState.isLoading = true;
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows the empty state when there are no experts', () => {
    renderPage();
    expect(screen.getByText(/Aucun expert vérifié/)).toBeInTheDocument();
  });

  it('renders an expert card with rating and bio', () => {
    useExpertsState.data = [expert()];
    renderPage();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('3 avis')).toBeInTheDocument();
    expect(screen.getByText('Spécialiste des visas de travail.')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('shows "no rating" for an expert with zero reviews', () => {
    useExpertsState.data = [expert({ ratingCount: 0 })];
    renderPage();
    expect(screen.getByText('Pas encore d’avis')).toBeInTheDocument();
  });

  it('filters the loaded list client-side by search text', () => {
    useExpertsState.data = [expert({ idUser: 1, fullName: 'Jean Dupont' }), expert({ idUser: 2, fullName: 'Marie Curie' })];
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Rechercher un expert…'), { target: { value: 'marie' } });
    expect(screen.getByText('Marie Curie')).toBeInTheDocument();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
  });

  it('re-queries useExperts when a country filter is chosen', async () => {
    renderPage();
    const select = await screen.findByText('France');
    fireEvent.change(select.closest('select')!, { target: { value: '1' } });
    expect(mockedUseExperts).toHaveBeenLastCalledWith(1);
  });

  it('shows a contact link for other users when authenticated, but not for oneself', () => {
    authState.user = { idUser: 1 };
    useExpertsState.data = [expert({ idUser: 1 }), expert({ idUser: 2, fullName: 'Marie Curie' })];
    renderPage();
    const links = screen.getAllByText('Envoyer un message');
    expect(links).toHaveLength(1); // only for the other user, not for idUser 1 (self)
  });

  it('shows no contact links when unauthenticated', () => {
    useExpertsState.data = [expert()];
    renderPage();
    expect(screen.queryByText('Envoyer un message')).not.toBeInTheDocument();
  });
});
