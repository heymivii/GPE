import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminProcedures from './AdminProcedures';

const mockGetAllDestinations = vi.fn();
// La génération est désactivée par défaut ; ces tests l'exercent, on l'active ici
// et on la coupe dans le dernier test.
const features = { GENERATION_ENABLED: true };
vi.mock('../../../config/features', () => ({
  get GENERATION_ENABLED() { return features.GENERATION_ENABLED; },
}));

vi.mock('../../../api/destinations', () => ({
  destinationsApi: { getAll: (...a: any[]) => mockGetAllDestinations(...a) },
}));

const mockGetAllProcedures = vi.fn();
const mockCreateProcedure = vi.fn();
const mockUpdateProcedure = vi.fn();
const mockDeleteProcedure = vi.fn();
const mockGenerateFromGovLinks = vi.fn();
vi.mock('../../../api/admin', () => ({
  adminApi: {
    getAllProcedures: (...a: any[]) => mockGetAllProcedures(...a),
    createProcedure: (...a: any[]) => mockCreateProcedure(...a),
    updateProcedure: (...a: any[]) => mockUpdateProcedure(...a),
    deleteProcedure: (...a: any[]) => mockDeleteProcedure(...a),
    generateFromGovLinks: (...a: any[]) => mockGenerateFromGovLinks(...a),
  },
}));

vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => ({
    countries: [
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Allemagne' },
    ],
  }),
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
      <AdminProcedures />
    </QueryClientProvider>,
  );
}

const country = (overrides: any = {}) => ({ idCountry: 1, countryName: 'France', isoCode: 'FR', ...overrides });
const procedure = (overrides: any = {}) => ({
  idAdminProcedure: 1,
  procedureType: 'Demander un visa',
  description: 'Se rendre au consulat',
  category: 'visa',
  stepOrder: 1,
  averageDelayDays: 15,
  country: { idCountry: 1 },
  ...overrides,
});

describe('AdminProcedures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockGetAllDestinations.mockResolvedValue([country()]);
    mockGetAllProcedures.mockResolvedValue([]);
  });

  it('shows a loading spinner for the procedures table', () => {
    mockGetAllProcedures.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('selects the first country automatically and shows the empty state', async () => {
    renderPage();
    expect(await screen.findByText(/Aucune démarche configurée pour ce pays/)).toBeInTheDocument();
    expect(screen.getByText('0 étape(s) configurée(s) pour ce pays.')).toBeInTheDocument();
  });

  it('renders procedures filtered and sorted for the selected country', async () => {
    mockGetAllProcedures.mockResolvedValue([
      procedure({ idAdminProcedure: 2, procedureType: 'Deuxième étape', stepOrder: 2, country: { idCountry: 1 } }),
      procedure({ idAdminProcedure: 1, procedureType: 'Première étape', stepOrder: 1, country: { idCountry: 1 } }),
      procedure({ idAdminProcedure: 3, procedureType: 'Autre pays', stepOrder: 1, country: { idCountry: 99 } }),
    ]);
    renderPage();
    await screen.findByText('Première étape');
    const rows = screen.getAllByRole('row').slice(1); // skip header row
    expect(rows[0]).toHaveTextContent('Première étape');
    expect(rows[1]).toHaveTextContent('Deuxième étape');
    expect(screen.queryByText('Autre pays')).not.toBeInTheDocument();
    expect(screen.getAllByText('Visa').length).toBe(2);
    expect(screen.getAllByText('15 jours').length).toBe(2);
  });

  it('shows the "no description" fallback', async () => {
    mockGetAllProcedures.mockResolvedValue([procedure({ description: '' })]);
    renderPage();
    expect(await screen.findByText('Aucune description')).toBeInTheDocument();
  });

  it('switches the selected country and refilters the table', async () => {
    mockGetAllDestinations.mockResolvedValue([country(), country({ idCountry: 2, countryName: 'Allemagne', isoCode: 'DE' })]);
    mockGetAllProcedures.mockResolvedValue([
      procedure({ idAdminProcedure: 1, procedureType: 'Procédure FR', country: { idCountry: 1 } }),
      procedure({ idAdminProcedure: 2, procedureType: 'Procédure DE', country: { idCountry: 2 } }),
    ]);
    renderPage();
    await screen.findByText('Procédure FR');
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '2' } });
    expect(screen.getByText('Procédure DE')).toBeInTheDocument();
    expect(screen.queryByText('Procédure FR')).not.toBeInTheDocument();
  });

  it('creates a new procedure', async () => {
    mockCreateProcedure.mockResolvedValue({});
    renderPage();
    await screen.findByText(/Aucune démarche configurée/);
    fireEvent.click(screen.getByText('Ajouter une démarche'));
    fireEvent.change(screen.getByPlaceholderText('Ex: Demander le numéro de sécurité sociale'), {
      target: { value: 'Nouvelle démarche' },
    });
    fireEvent.click(screen.getByText('Sauvegarder'));
    await waitFor(() =>
      expect(mockCreateProcedure).toHaveBeenCalledWith(
        expect.objectContaining({ procedureType: 'Nouvelle démarche', countryId: 1 }),
      ),
    );
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
  });

  it('opens the edit modal pre-filled and updates the procedure', async () => {
    mockGetAllProcedures.mockResolvedValue([procedure()]);
    mockUpdateProcedure.mockResolvedValue({});
    renderPage();
    await screen.findByText('Demander un visa');
    fireEvent.click(screen.getByTitle('Modifier'));
    expect(screen.getByText('Modifier la démarche')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Demander le numéro de sécurité sociale')).toHaveValue('Demander un visa');

    fireEvent.change(screen.getByPlaceholderText('Ex: Demander le numéro de sécurité sociale'), {
      target: { value: 'Visa modifié' },
    });
    fireEvent.click(screen.getByText('Sauvegarder'));
    await waitFor(() =>
      expect(mockUpdateProcedure).toHaveBeenCalledWith(1, expect.objectContaining({ procedureType: 'Visa modifié' })),
    );
  });

  it('deletes a procedure after confirmation', async () => {
    mockGetAllProcedures.mockResolvedValue([procedure()]);
    mockDeleteProcedure.mockResolvedValue({});
    renderPage();
    await screen.findByText('Demander un visa');
    fireEvent.click(screen.getByTitle('Supprimer'));
    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(mockDeleteProcedure).toHaveBeenCalledWith(1));
  });

  it('does not delete when the confirmation is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockGetAllProcedures.mockResolvedValue([procedure()]);
    renderPage();
    await screen.findByText('Demander un visa');
    fireEvent.click(screen.getByTitle('Supprimer'));
    expect(mockDeleteProcedure).not.toHaveBeenCalled();
  });

  it('generates procedures from gov links', async () => {
    mockGenerateFromGovLinks.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    renderPage();
    await screen.findByText(/Aucune démarche configurée/);
    fireEvent.click(screen.getByText('Générer'));
    await waitFor(() => expect(mockGenerateFromGovLinks).toHaveBeenCalledWith('FR'));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith('2 démarche(s) générée(s) — vérifiez la liste ci-dessous.'));
  });

  it('changes the generation target country', async () => {
    renderPage();
    await screen.findByText(/Aucune démarche configurée/);
    const selects = screen.getAllByRole('combobox');
    const genSelect = selects[selects.length - 1];
    fireEvent.change(genSelect, { target: { value: 'DE' } });
    fireEvent.click(screen.getByText('Générer'));
    await waitFor(() => expect(mockGenerateFromGovLinks).toHaveBeenCalledWith('DE'));
  });

  it('closes the modal via cancel', async () => {
    renderPage();
    await screen.findByText(/Aucune démarche configurée/);
    fireEvent.click(screen.getByText('Ajouter une démarche'));
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.queryByText('Ajouter une démarche', { selector: 'h2' })).not.toBeInTheDocument();
  });

  it('shows an error toast when creation fails', async () => {
    mockCreateProcedure.mockRejectedValue({ response: { data: { message: 'Erreur validation.' } } });
    renderPage();
    await screen.findByText(/Aucune démarche configurée/);
    fireEvent.click(screen.getByText('Ajouter une démarche'));
    fireEvent.change(screen.getByPlaceholderText('Ex: Demander le numéro de sécurité sociale'), {
      target: { value: 'X' },
    });
    fireEvent.click(screen.getByText('Sauvegarder'));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Erreur validation.'));
  });

  it('shows the correct label for every procedure category', async () => {
    mockGetAllProcedures.mockResolvedValue([
      procedure({ idAdminProcedure: 1, category: 'pre-departure', stepOrder: 1 }),
      procedure({ idAdminProcedure: 2, category: 'administratif', stepOrder: 2 }),
      procedure({ idAdminProcedure: 3, category: 'logement', stepOrder: 3 }),
      procedure({ idAdminProcedure: 4, category: 'sante', stepOrder: 4 }),
      procedure({ idAdminProcedure: 5, category: 'finance', stepOrder: 5 }),
      procedure({ idAdminProcedure: 6, category: 'arrival', stepOrder: 6 }),
      procedure({ idAdminProcedure: 7, category: 'integration', stepOrder: 7 }),
      procedure({ idAdminProcedure: 8, category: 'vie-quotidienne', stepOrder: 8 }),
      procedure({ idAdminProcedure: 9, category: 'inconnue', stepOrder: 9 }),
    ]);
    renderPage();
    await screen.findByText('Avant départ');
    expect(screen.getByText('Administratif')).toBeInTheDocument();
    expect(screen.getByText('Logement')).toBeInTheDocument();
    expect(screen.getByText('Santé')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Arrivée')).toBeInTheDocument();
    expect(screen.getByText('Intégration')).toBeInTheDocument();
    expect(screen.getByText('Vie quotidienne')).toBeInTheDocument();
    expect(screen.getByText('inconnue')).toBeInTheDocument();
  });

  it('edits the step order and delay-days fields in the create modal', async () => {
    mockCreateProcedure.mockResolvedValue({});
    renderPage();
    await screen.findByText(/Aucune démarche configurée/);
    fireEvent.click(screen.getByText('Ajouter une démarche'));
    fireEvent.change(screen.getByPlaceholderText('Ex: Demander le numéro de sécurité sociale'), {
      target: { value: 'X' },
    });
    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '3' } });
    fireEvent.change(numberInputs[1], { target: { value: '45' } });
    fireEvent.change(screen.getByPlaceholderText(/Expliquez brièvement/), { target: { value: 'Détails' } });
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'logement' } });
    fireEvent.click(screen.getByText('Sauvegarder'));
    await waitFor(() =>
      expect(mockCreateProcedure).toHaveBeenCalledWith(
        expect.objectContaining({ stepOrder: 3, averageDelayDays: 45, description: 'Détails', category: 'logement' }),
      ),
    );
  });

  it('refetches when the refresh button is clicked', async () => {
    renderPage();
    await screen.findByText(/Aucune démarche configurée/);
    fireEvent.click(screen.getByText('Rafraîchir'));
    expect(mockGetAllProcedures).toHaveBeenCalledTimes(2);
  });

  it('masque toute génération quand l’interrupteur est coupé, mais explique pourquoi', () => {
    features.GENERATION_ENABLED = false;
    try {
      renderPage();
      expect(screen.queryByText('Générer')).not.toBeInTheDocument();
      expect(screen.getByText(/Génération automatique désactivée/)).toBeInTheDocument();
    } finally {
      features.GENERATION_ENABLED = true;
    }
  });
});
