import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminCities from './AdminCities';
import { useAuth } from '../../../hooks/useAuth';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.defaultValue ?? key }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseMutation = vi.mocked(useMutation);
const mockedUseQueryClient = vi.mocked(useQueryClient);
const mockedUseAuth = vi.mocked(useAuth);

const invalidateQueries = vi.fn();

const M = {
  createCity: vi.fn(),
  updateCity: vi.fn(),
  deleteCity: vi.fn(),
  archive: vi.fn(),
  reviewDone: vi.fn(),
  review: vi.fn(),
  saveCost: vi.fn(),
  fetchCol: vi.fn(),
};

function identifyMutation(config: any): keyof typeof M | null {
  const fnText = config.mutationFn?.toString() || '';
  const successText = config.onSuccess?.toString() || '';
  if (fnText.includes('reviewDone')) return 'reviewDone';
  if (fnText.includes('adminFetch')) return 'fetchCol';
  if (fnText.includes('updateCostOfLiving')) return 'saveCost';
  if (fnText.includes('approve')) return 'review';
  if (successText.includes('Ville créée')) return 'createCity';
  if (successText.includes('Ville mise')) return 'updateCity';
  if (successText.includes('Ville supprimée')) return 'deleteCity';
  if (fnText.includes('status')) return 'archive';
  return null;
}

const countries = [
  { idCountry: 1, countryName: 'France' },
  { idCountry: 2, countryName: 'Canada' },
];

const cities = [
  { idCity: 1, name: 'Paris', countryId: 1, country: { countryName: 'France' }, status: 'active' },
  {
    idCity: 2,
    name: 'Nouvelle-Ville',
    countryId: 1,
    country: { countryName: 'France' },
    status: 'pending_review',
    createdBy: { idUser: 200, firstName: 'Aminata' },
  },
  {
    idCity: 3,
    name: 'Ville Assignée',
    countryId: 1,
    country: { countryName: 'France' },
    status: 'pending_review',
    assignedToId: 100,
    createdBy: { idUser: 200, firstName: 'Aminata' },
    assignedTo: { firstName: 'Admin' },
  },
  {
    idCity: 4,
    name: 'Ville Vérifiée',
    countryId: 1,
    country: { countryName: 'France' },
    status: 'review_done',
    assignedToId: 200,
    reviewedBy: { idUser: 300, firstName: 'Bob' },
    createdBy: { idUser: 200, firstName: 'Aminata' },
  },
  { idCity: 5, name: 'Ville Archivée', countryId: 1, country: { countryName: 'France' }, status: 'archived' },
];

function setup({ citiesLoading = false, citiesList = cities }: any = {}) {
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
  mockedUseAuth.mockReturnValue({ user: { idUser: 100 } } as any);
  mockedUseMutation.mockImplementation(((config: any) => {
    const key = identifyMutation(config);
    const spy = key ? M[key] : vi.fn();
    return { mutate: spy, mutateAsync: spy, isPending: false };
  }) as any);
  mockedUseQuery.mockImplementation((opts: any) => {
    const key = opts.queryKey[0];
    if (key === 'admin-cities-list') return { data: citiesList, isLoading: citiesLoading, refetch: vi.fn(), isRefetching: false } as any;
    if (key === 'admin-countries-dropdown') return { data: countries, isLoading: false } as any;
    if (key === 'admins-for-assignment') return { data: { data: [] } } as any;
    if (key === 'admin-city-cost-of-living') return { data: undefined, isLoading: false } as any;
    if (key === 'admin-city-indices-summary') return { data: undefined, isLoading: false } as any;
    if (key === 'geo-cities') return { data: [] } as any;
    return { data: undefined, isLoading: false } as any;
  });
}

describe('AdminCities (list view)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows a loading state while cities are loading', () => {
    setup({ citiesLoading: true });
    const { container } = render(<AdminCities />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('lists active cities by default (archived hidden)', () => {
    setup();
    render(<AdminCities />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.queryByText('Ville Archivée')).not.toBeInTheDocument();
  });

  it('switches to the trash tab and shows only archived cities', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByText(/Corbeille/));
    expect(screen.getByText('Ville Archivée')).toBeInTheDocument();
    expect(screen.queryByText('Paris')).not.toBeInTheDocument();
  });

  it('filters by search query', () => {
    setup();
    render(<AdminCities />);
    fireEvent.change(screen.getByPlaceholderText('Rechercher par nom de ville...'), { target: { value: 'paris' } });
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.queryByText('Nouvelle-Ville')).not.toBeInTheDocument();
  });

  it('shows the right status label per city', () => {
    setup();
    render(<AdminCities />);
    expect(screen.getAllByText('À vérifier').length).toBeGreaterThan(0);
  });

  it('requires a non-blank city name before creating', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByText('Ajouter une ville'));
    fireEvent.change(screen.getByPlaceholderText('Tape ou choisis une ville…'), { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(toast.error).toHaveBeenCalledWith('Le nom de la ville est requis.');
    expect(M.createCity).not.toHaveBeenCalled();
  });

  it('creates a city with the default (first) country', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByText('Ajouter une ville'));
    fireEvent.change(screen.getByPlaceholderText('Tape ou choisis une ville…'), { target: { value: 'Lyon' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(M.createCity).toHaveBeenCalledWith(expect.objectContaining({ name: 'Lyon', countryId: 1 }));
  });

  it('opens the edit modal pre-filled and submits an update', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getAllByTitle('Modifier')[0]);
    expect(screen.getByText('Modifier la ville')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(M.updateCity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, data: expect.objectContaining({ name: 'Paris' }) }),
    );
  });

  it('shows approve/reject for a pending review with no assignee, and approves it', () => {
    setup();
    render(<AdminCities />);
    // Both city2 (no assignee) and city4 (finalizing an assigned review) show this action;
    // city2's row comes first in the table.
    fireEvent.click(screen.getAllByTitle('Valider et publier')[0]);
    expect(M.review).toHaveBeenCalledWith({ id: 2, approve: true });
  });

  it('rejects a pending review after confirmation', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByTitle('Rejeter (non publiée)'));
    expect(window.confirm).toHaveBeenCalled();
    expect(M.review).toHaveBeenCalledWith({ id: 2, approve: false });
  });

  it('shows the "mark reviewed" action for the assigned reviewer', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByTitle("J'ai vérifié cette ville — l'auteur validera ensuite"));
    expect(M.reviewDone).toHaveBeenCalledWith(3);
  });

  it('shows the finalize action once the assigned review is done', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByTitle('Renvoyer en review'));
    expect(window.confirm).toHaveBeenCalled();
    expect(M.review).toHaveBeenCalledWith({ id: 4, approve: false });
  });

  it('archives an active city after confirmation', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByTitle('Archiver'));
    expect(M.archive).toHaveBeenCalledWith({ id: 1, status: 'archived' });
  });

  it('restores an archived city from the trash', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByText(/Corbeille/));
    fireEvent.click(screen.getByTitle('Réactiver'));
    expect(M.archive).toHaveBeenCalledWith({ id: 5, status: 'active' });
  });

  it('permanently deletes a city from the trash after confirmation', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getByText(/Corbeille/));
    fireEvent.click(screen.getByTitle('Supprimer définitivement'));
    expect(window.confirm).toHaveBeenCalled();
    expect(M.deleteCity).toHaveBeenCalledWith(5);
  });

  it('opens the city detail view', () => {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getAllByTitle('Voir la fiche')[0]);
    expect(screen.getByText(/Fiche Ville/)).toBeInTheDocument();
  });
});

describe('AdminCities (detail view)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  function openDetail() {
    setup();
    render(<AdminCities />);
    fireEvent.click(screen.getAllByTitle('Voir la fiche')[0]);
  }

  it('pre-fills the city name and requires it non-blank to save', () => {
    openDetail();
    const nameInput = screen.getByDisplayValue('Paris');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByText(/Enregistrer/));
    expect(toast.error).toHaveBeenCalledWith('Le nom de la ville est requis.');
    expect(M.updateCity).not.toHaveBeenCalled();
  });

  it('saves the city details (no cost-of-living data loaded, so only the city payload is sent)', () => {
    openDetail();
    fireEvent.change(screen.getByDisplayValue('Paris'), { target: { value: 'Paris (Île-de-France)' } });
    fireEvent.click(screen.getByText(/Enregistrer/));
    expect(M.updateCity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, data: expect.objectContaining({ name: 'Paris (Île-de-France)' }) }),
    );
    expect(M.saveCost).not.toHaveBeenCalled();
  });

  it('returns to the list view', () => {
    openDetail();
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.getByText('Gestion des Villes')).toBeInTheDocument();
  });
});
