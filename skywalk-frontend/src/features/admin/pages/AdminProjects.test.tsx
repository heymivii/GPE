import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminProjects from './AdminProjects';

const mockGetAllProjects = vi.fn();
const mockUpdateProjectStatus = vi.fn();
vi.mock('../../../api/admin', () => ({
  adminApi: {
    getAllProjects: (...a: any[]) => mockGetAllProjects(...a),
    updateProjectStatus: (...a: any[]) => mockUpdateProjectStatus(...a),
  },
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('react-hot-toast', () => ({
  default: { success: (...a: any[]) => mockToastSuccess(...a), error: (...a: any[]) => mockToastError(...a) },
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AdminProjects />
    </QueryClientProvider>,
  );
}

const project = (overrides: any = {}) => ({
  idProject: 1,
  user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' },
  destinationCountry: { countryName: 'France' },
  destinationCity: { name: 'Paris' },
  objective: 'work',
  budget: '1500.5',
  expectedDuration: 12,
  expectedDepartureDate: '2026-06-01',
  status: 'active',
  ...overrides,
});

describe('AdminProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner', () => {
    mockGetAllProjects.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an error state with a retry button', async () => {
    mockGetAllProjects.mockRejectedValue(new Error('boom'));
    renderPage();
    expect(await screen.findByText('Erreur de chargement')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Réessayer'));
    expect(mockGetAllProjects).toHaveBeenCalledTimes(2);
  });

  it('shows the empty state when there are no projects', async () => {
    mockGetAllProjects.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aucun projet ne correspond à votre recherche.')).toBeInTheDocument();
  });

  it('renders project rows with objective, budget, duration, and formatted date', async () => {
    mockGetAllProjects.mockResolvedValue([project()]);
    renderPage();
    expect(await screen.findByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('jean@example.com')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Travail')).toBeInTheDocument();
    expect(screen.getByText(/1\s?500.*€\/mois/)).toBeInTheDocument();
    expect(screen.getByText('12 mois')).toBeInTheDocument();
    expect(screen.getAllByText('Actif').length).toBeGreaterThan(0);
  });

  it('shows fallbacks for missing user name, country, and departure date', async () => {
    mockGetAllProjects.mockResolvedValue([
      project({ user: { email: 'x@x.com' }, destinationCountry: null, destinationCity: null, expectedDepartureDate: null, budget: null, expectedDuration: null }),
    ]);
    renderPage();
    expect(await screen.findByText('Utilisateur')).toBeInTheDocument();
    expect(screen.getByText('Pays inconnu')).toBeInTheDocument();
    expect(screen.getByText('Non planifié')).toBeInTheDocument();
  });

  it('filters projects by search term across user, email, country, and city', async () => {
    mockGetAllProjects.mockResolvedValue([
      project({ idProject: 1, user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' } }),
      project({ idProject: 2, user: { firstName: 'Marie', lastName: 'Curie', email: 'marie@example.com' }, destinationCountry: { countryName: 'Allemagne' }, destinationCity: null }),
    ]);
    renderPage();
    await screen.findByText('Jean Dupont');
    fireEvent.change(screen.getByPlaceholderText('Rechercher par email, utilisateur, pays...'), {
      target: { value: 'marie' },
    });
    expect(screen.getByText('Marie Curie')).toBeInTheDocument();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
  });

  it('updates a project status and shows a success toast', async () => {
    mockGetAllProjects.mockResolvedValue([project()]);
    mockUpdateProjectStatus.mockResolvedValue({});
    renderPage();
    await screen.findByText('Jean Dupont');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'completed' } });
    await waitFor(() => expect(mockUpdateProjectStatus).toHaveBeenCalledWith(1, 'completed'));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
  });

  it('shows an error toast when updating the status fails', async () => {
    mockGetAllProjects.mockResolvedValue([project()]);
    mockUpdateProjectStatus.mockRejectedValue({ response: { data: { message: 'Statut invalide.' } } });
    renderPage();
    await screen.findByText('Jean Dupont');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cancelled' } });
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Statut invalide.'));
  });

  it('renders the correct label for every status and objective', async () => {
    mockGetAllProjects.mockResolvedValue([
      project({ idProject: 1, status: 'planning', objective: 'study' }),
      project({ idProject: 2, status: 'completed', objective: 'retirement' }),
      project({ idProject: 3, status: 'cancelled', objective: 'investment' }),
      project({ idProject: 4, status: 'on_hold', objective: 'adventure' }),
      project({ idProject: 5, status: 'weird_status', objective: 'family_reunion' }),
      project({ idProject: 6, status: 'active', objective: 'internship' }),
      project({ idProject: 7, status: 'active', objective: 'other' }),
      project({ idProject: 8, status: 'active', objective: null }),
    ]);
    renderPage();
    await screen.findByText('weird_status');
    expect(screen.getAllByText('Planification').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Complété').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Annulé').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En pause').length).toBeGreaterThan(0);
    expect(screen.getByText('Études')).toBeInTheDocument();
    expect(screen.getByText('Retraite')).toBeInTheDocument();
    expect(screen.getByText('Investissement')).toBeInTheDocument();
    expect(screen.getByText('Aventure / Découverte')).toBeInTheDocument();
    expect(screen.getByText('Regroupement familial')).toBeInTheDocument();
    expect(screen.getByText('Stage')).toBeInTheDocument();
    expect(screen.getByText('Autre')).toBeInTheDocument();
    expect(screen.getByText('Non spécifié')).toBeInTheDocument();
  });

  it('refetches when the refresh button is clicked', async () => {
    mockGetAllProjects.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Aucun projet ne correspond à votre recherche.');
    fireEvent.click(screen.getByText('Rafraîchir'));
    expect(mockGetAllProjects).toHaveBeenCalledTimes(2);
  });
});
