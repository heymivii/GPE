import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminCountries from './AdminCountries';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.defaultValue ?? key }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseMutation = vi.mocked(useMutation);
const mockedUseQueryClient = vi.mocked(useQueryClient);

const invalidateQueries = vi.fn();

// One spy per mutation, identified via distinctive text in mutationFn/onSuccess source.
const M = {
  lockTopic: vi.fn(),
  pinTopic: vi.fn(),
  deleteTopic: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
  deleteResource: vi.fn(),
  createProc: vi.fn(),
  updateProc: vi.fn(),
  deleteProc: vi.fn(),
  createCountry: vi.fn(),
  updateCountry: vi.fn(),
  deleteCountry: vi.fn(),
  archive: vi.fn(),
  review: vi.fn(),
};

function identifyMutation(config: any): keyof typeof M | null {
  const text = (config.mutationFn?.toString() || '') + (config.onSuccess?.toString() || '');
  if (text.includes('verrouillage')) return 'lockTopic';
  if (text.includes('épinglage')) return 'pinTopic';
  if (text.includes('Sujet supprimé')) return 'deleteTopic';
  if (text.includes('Ressource ajoutée')) return 'createResource';
  if (text.includes('Ressource mise')) return 'updateResource';
  if (text.includes('Ressource supprimée')) return 'deleteResource';
  if (text.includes('Démarche administrative créée')) return 'createProc';
  if (text.includes('Démarche administrative mise')) return 'updateProc';
  if (text.includes('Démarche administrative supprimée')) return 'deleteProc';
  if (text.includes('Pays créé')) return 'createCountry';
  if (text.includes('Pays mis')) return 'updateCountry';
  if (text.includes('Pays supprimé')) return 'deleteCountry';
  if (text.includes('approve')) return 'review';
  if (text.includes('status')) return 'archive';
  return null;
}

const countries = [
  { idCountry: 1, countryName: 'France', isoCode: 'FR', continentId: 1, continent: { name: 'europe' }, status: 'active', selectableAsDestination: true },
  { idCountry: 2, countryName: 'Nouvelle-Zélande', isoCode: 'NZ', continentId: 2, continent: { name: 'oceania' }, status: 'pending_review', selectableAsDestination: true, createdBy: { firstName: 'Aminata' } },
  { idCountry: 3, countryName: 'Vieux-Pays', isoCode: 'VP', continentId: 1, continent: { name: 'europe' }, status: 'archived', selectableAsDestination: true },
];

const continents = [
  { idContinent: 1, name: 'europe' },
  { idContinent: 2, name: 'oceania' },
];

const procedures = [
  { idAdminProcedure: 1, procedureType: 'Demande de visa', category: 'Visa', stepOrder: 1, averageDelayDays: 30, description: 'Déposer le dossier' },
];

const resources = [{ idResource: 1, title: 'Guide officiel', url: 'https://gouv.fr/guide', resourceType: 'article' }];

const forumTopics = [
  { topic_id: 1, title: 'Question logement', is_pinned: false, is_locked: false, user: { fullName: 'Bob' }, created_at: '2026-01-01T00:00:00Z', views_count: 12 },
];

function setup({
  countriesLoading = false,
  proceduresLoading = false,
  resourcesLoading = false,
  forumTopicsLoading = false,
}: any = {}) {
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
  mockedUseMutation.mockImplementation(((config: any) => {
    const key = identifyMutation(config);
    const spy = key ? M[key] : vi.fn();
    return { mutate: spy, mutateAsync: spy, isPending: false };
  }) as any);
  mockedUseQuery.mockImplementation((opts: any) => {
    const key = opts.queryKey[0];
    if (key === 'admin-countries-list') return { data: countries, isLoading: countriesLoading, refetch: vi.fn(), isRefetching: false } as any;
    if (key === 'admin-continents-dropdown') return { data: continents, isLoading: false } as any;
    if (key === 'admin-country-procedures') return { data: procedures, isLoading: proceduresLoading } as any;
    if (key === 'admin-country-resources') return { data: resources, isLoading: resourcesLoading } as any;
    if (key === 'admin-country-forum-topics') return { data: forumTopics, isLoading: forumTopicsLoading } as any;
    if (key === 'admin-country-cities') return { data: [], isLoading: false } as any;
    if (key === 'admin-city-cost-of-living-view') return { data: undefined, isLoading: false } as any;
    if (key === 'admin-country-jobs') return { data: undefined, isLoading: false } as any;
    if (key === 'geo-available-countries') return { data: [{ code: 'CA', name: 'Canada' }] } as any;
    return { data: undefined, isLoading: false } as any;
  });
}

describe('AdminCountries (list view)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows a loading state while countries are loading', () => {
    setup({ countriesLoading: true });
    const { container } = render(<AdminCountries />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('lists every country with its status', () => {
    setup();
    render(<AdminCountries />);
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('À vérifier')).toBeInTheDocument();
    expect(screen.getByText('Archivé')).toBeInTheDocument();
  });

  it('filters countries by search query', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.change(screen.getByPlaceholderText('Rechercher par nom, code ISO...'), { target: { value: 'france' } });
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.queryByText('Nouvelle-Zélande')).not.toBeInTheDocument();
  });

  it('filters countries by continent', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.change(screen.getByDisplayValue('Tous les continents'), { target: { value: '2' } });
    expect(screen.getByText('Nouvelle-Zélande')).toBeInTheDocument();
    expect(screen.queryByText('France')).not.toBeInTheDocument();
  });

  it('requires a non-blank country name before creating', () => {
    // The name input also has the native `required` attribute, which blocks jsdom form
    // submission for a genuinely empty value — use whitespace to reach the JS validation.
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getByText('Ajouter un pays'));
    fireEvent.change(screen.getByPlaceholderText('Tape ou choisis un pays (ex. Canada)...'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(toast.error).toHaveBeenCalledWith('Le nom du pays est requis.');
    expect(M.createCountry).not.toHaveBeenCalled();
  });

  it('confirms then creates a country (continent defaults to the first one)', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getByText('Ajouter un pays'));
    fireEvent.change(screen.getByPlaceholderText('Tape ou choisis un pays (ex. Canada)...'), {
      target: { value: 'Canada' },
    });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(window.confirm).toHaveBeenCalled();
    expect(M.createCountry).toHaveBeenCalledWith(
      expect.objectContaining({ countryName: 'Canada', continentId: 1, selectableAsDestination: true }),
    );
  });

  it('does not create when the confirmation is dismissed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getByText('Ajouter un pays'));
    fireEvent.change(screen.getByPlaceholderText('Tape ou choisis un pays (ex. Canada)...'), {
      target: { value: 'Canada' },
    });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(M.createCountry).not.toHaveBeenCalled();
  });

  it('opens the edit modal pre-filled and submits an update (no confirmation needed)', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getAllByTitle('Modifier')[0]);
    expect(screen.getByText('Modifier le pays')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(M.updateCountry).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, data: expect.objectContaining({ countryName: 'France' }) }),
    );
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('approves a pending-review country', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getByTitle("Approuver et publier (un autre admin que l'auteur)"));
    expect(M.review).toHaveBeenCalledWith({ id: 2, approve: true });
  });

  it('rejects a pending-review country after confirmation', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getByTitle('Rejeter'));
    expect(window.confirm).toHaveBeenCalled();
    expect(M.review).toHaveBeenCalledWith({ id: 2, approve: false });
  });

  it('archives an active country after confirmation', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getByTitle('Archiver'));
    expect(M.archive).toHaveBeenCalledWith({ id: 1, status: 'archived' });
  });

  it('reactivates an archived country', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getByTitle('Réactiver'));
    expect(M.archive).toHaveBeenCalledWith({ id: 3, status: 'active' });
  });

  it('opens the country detail view', () => {
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getAllByTitle('Voir la fiche')[0]);
    expect(screen.getByText('Fiche Pays : France')).toBeInTheDocument();
  });
});

describe('AdminCountries (detail view)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  function openDetail() {
    setup();
    render(<AdminCountries />);
    fireEvent.click(screen.getAllByTitle('Voir la fiche')[0]);
  }

  it('shows the procedures tab by default with existing procedures', () => {
    openDetail();
    expect(screen.getByText('Demande de visa')).toBeInTheDocument();
  });

  it('adds a procedure', () => {
    openDetail();
    fireEvent.click(screen.getByText('Ajouter une démarche'));
    fireEvent.change(screen.getByPlaceholderText('ex. Demande de Visa VLS-TS'), { target: { value: 'Titre de séjour' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(M.createProc).toHaveBeenCalledWith(expect.objectContaining({ procedureType: 'Titre de séjour', countryId: 1 }));
  });

  it('edits a procedure', () => {
    openDetail();
    fireEvent.click(screen.getByTitle('Modifier la démarche'));
    expect(screen.getByDisplayValue('Demande de visa')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(M.updateProc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, data: expect.objectContaining({ procedureType: 'Demande de visa' }) }),
    );
  });

  it('deletes a procedure after confirmation', () => {
    openDetail();
    fireEvent.click(screen.getByTitle('Supprimer la démarche'));
    expect(window.confirm).toHaveBeenCalled();
    expect(M.deleteProc).toHaveBeenCalledWith(1);
  });

  it('switches to the forum tab and moderates a topic', () => {
    openDetail();
    fireEvent.click(screen.getByText('Forum'));
    expect(screen.getByText('Question logement')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Épingler'));
    expect(M.pinTopic).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByTitle('Verrouiller'));
    expect(M.lockTopic).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByTitle('Supprimer'));
    expect(window.confirm).toHaveBeenCalled();
    expect(M.deleteTopic).toHaveBeenCalledWith(1);
  });

  it('switches to the resources tab and lists resources', () => {
    openDetail();
    fireEvent.click(screen.getByText('Ressources'));
    expect(screen.getByText('Guide officiel')).toBeInTheDocument();
  });

  // Known bug: the add/edit resource modal JSX lives in the list-view return branch,
  // so it never mounts while a country is being viewed — clicking the button is a no-op.
  it('BUG: "Ajouter une ressource" does not open a form (dead code in the wrong return branch)', () => {
    openDetail();
    fireEvent.click(screen.getByText('Ressources'));
    fireEvent.click(screen.getByText('Ajouter une ressource'));
    expect(screen.queryByPlaceholderText("ex. Guide d'expatriation au Canada")).not.toBeInTheDocument();
  });

  it('saves the country detail form', () => {
    openDetail();
    fireEvent.change(screen.getByDisplayValue('France'), { target: { value: 'République Française' } });
    fireEvent.click(screen.getByText('Enregistrer les modifications'));
    expect(M.updateCountry).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, data: expect.objectContaining({ countryName: 'République Française' }) }),
    );
  });

  it('requires a country name before saving the detail form', () => {
    openDetail();
    fireEvent.change(screen.getByDisplayValue('France'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Enregistrer les modifications'));
    expect(toast.error).toHaveBeenCalledWith('Le nom du pays est requis.');
    expect(M.updateCountry).not.toHaveBeenCalled();
  });

  it('returns to the list view', () => {
    openDetail();
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.getByText('Gestion des Pays')).toBeInTheDocument();
  });
});
