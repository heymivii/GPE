import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminContinents from './AdminContinents';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.defaultValue ?? key,
  }),
}));

const mockGetAll = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
vi.mock('../../../api/continent', () => ({
  continentApi: {
    getAll: (...a: any[]) => mockGetAll(...a),
    create: (...a: any[]) => mockCreate(...a),
    update: (...a: any[]) => mockUpdate(...a),
    delete: (...a: any[]) => mockDelete(...a),
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
      <AdminContinents />
    </QueryClientProvider>,
  );
}

const continent = (overrides: any = {}) => ({ idContinent: 1, name: 'Europe', isoCode: 'EU', ...overrides });

describe('AdminContinents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows a loading spinner', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows the empty state when there are no continents', async () => {
    mockGetAll.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Aucun continent configuré.')).toBeInTheDocument();
  });

  it('renders a row per continent with its ISO badge', async () => {
    mockGetAll.mockResolvedValue([continent(), continent({ idContinent: 2, name: 'Asie', isoCode: null })]);
    renderPage();
    expect(await screen.findByText('Europe')).toBeInTheDocument();
    expect(screen.getByText('EU')).toBeInTheDocument();
    expect(screen.getByText('Asie')).toBeInTheDocument();
    expect(screen.getByText('Non configuré')).toBeInTheDocument();
  });

  it('opens the create modal and creates a continent', async () => {
    mockGetAll.mockResolvedValue([]);
    mockCreate.mockResolvedValue({});
    renderPage();
    await screen.findByText('Aucun continent configuré.');
    fireEvent.click(screen.getByText('Ajouter un continent'));
    expect(screen.getByText('Ajouter un continent', { selector: 'h3' })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('ex. Europe, Amérique du Nord...'), { target: { value: 'Océanie' } });
    fireEvent.change(screen.getByPlaceholderText('ex. EU, NA, AS...'), { target: { value: 'oc' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({ name: 'Océanie', isoCode: 'OC' }));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
  });

  it('rejects an empty name on submit', async () => {
    mockGetAll.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Aucun continent configuré.');
    fireEvent.click(screen.getByText('Ajouter un continent'));
    fireEvent.change(screen.getByPlaceholderText('ex. Europe, Amérique du Nord...'), { target: { value: '   ' } });
    const form = screen.getByPlaceholderText('ex. Europe, Amérique du Nord...').closest('form')!;
    fireEvent.submit(form);
    expect(mockToastError).toHaveBeenCalledWith('Le nom est requis.');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('opens the edit modal pre-filled and updates the continent', async () => {
    mockGetAll.mockResolvedValue([continent()]);
    mockUpdate.mockResolvedValue({});
    renderPage();
    await screen.findByText('Europe');
    fireEvent.click(screen.getByTitle('Modifier'));
    expect(screen.getByText('Modifier le continent')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ex. Europe, Amérique du Nord...')).toHaveValue('Europe');

    fireEvent.change(screen.getByPlaceholderText('ex. Europe, Amérique du Nord...'), { target: { value: 'Europe modifiée' } });
    fireEvent.click(screen.getByText('Enregistrer'));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(1, { name: 'Europe modifiée', isoCode: 'EU' }),
    );
  });

  it('closes the modal via the cancel button and the X icon', async () => {
    mockGetAll.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Aucun continent configuré.');
    fireEvent.click(screen.getByText('Ajouter un continent'));
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.queryByText('Modifier le continent')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Ajouter un continent'));
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(screen.queryByPlaceholderText('ex. Europe, Amérique du Nord...')).not.toBeInTheDocument();
  });

  it('deletes a continent after confirmation', async () => {
    mockGetAll.mockResolvedValue([continent()]);
    mockDelete.mockResolvedValue({});
    renderPage();
    await screen.findByText('Europe');
    fireEvent.click(screen.getByTitle('Supprimer'));
    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(1));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith('Continent supprimé.'));
  });

  it('does not delete when the confirmation is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockGetAll.mockResolvedValue([continent()]);
    renderPage();
    await screen.findByText('Europe');
    fireEvent.click(screen.getByTitle('Supprimer'));
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('shows an error toast when creation fails', async () => {
    mockGetAll.mockResolvedValue([]);
    mockCreate.mockRejectedValue({ response: { data: { message: 'Nom déjà utilisé.' } } });
    renderPage();
    await screen.findByText('Aucun continent configuré.');
    fireEvent.click(screen.getByText('Ajouter un continent'));
    fireEvent.change(screen.getByPlaceholderText('ex. Europe, Amérique du Nord...'), { target: { value: 'Europe' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Nom déjà utilisé.'));
  });

  it('refetches when the refresh button is clicked', async () => {
    mockGetAll.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Aucun continent configuré.');
    fireEvent.click(screen.getByText('Rafraîchir'));
    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });
});
