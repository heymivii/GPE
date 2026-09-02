import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminSearchHints from './AdminSearchHints';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => ({
    countries: [
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    ],
  }),
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseMutation = vi.mocked(useMutation);
const mockedUseQueryClient = vi.mocked(useQueryClient);

const mutate = vi.fn();
const invalidateQueries = vi.fn();

const hints = [
  {
    id: 1,
    countryCode: 'FR',
    category: 'visa',
    officialDomains: ['france-visas.gouv.fr'],
    keywords: 'visa long séjour',
    queryLang: 'fr',
    excludeTerms: [],
    pinnedUrl: null,
  },
  {
    id: 2,
    countryCode: 'CA',
    category: 'logement',
    officialDomains: [],
    keywords: '',
    queryLang: 'en',
    excludeTerms: [],
    pinnedUrl: 'https://example.com/pinned',
  },
];

function setup({ isLoading = false, isError = false, hintsList = hints }: any = {}) {
  mockedUseQuery.mockReturnValue({ data: hintsList, isLoading, isError } as any);
  mockedUseMutation.mockReturnValue({ mutate, isPending: false } as any);
  mockedUseQueryClient.mockReturnValue({ invalidateQueries } as any);
}

describe('AdminSearchHints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows a loading state while fetching', () => {
    setup({ isLoading: true });
    const { container } = render(<AdminSearchHints />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows an error state when the query fails', () => {
    setup({ isError: true });
    render(<AdminSearchHints />);
    expect(screen.getByText(/Erreur lors du chargement/)).toBeInTheDocument();
  });

  it('shows an empty state when there are no hints', () => {
    setup({ hintsList: [] });
    render(<AdminSearchHints />);
    expect(screen.getByText(/Aucune fiche/)).toBeInTheDocument();
  });

  it('lists every hint with its domains and keywords', () => {
    setup();
    render(<AdminSearchHints />);
    expect(screen.getByText('france-visas.gouv.fr')).toBeInTheDocument();
    expect(screen.getByText('visa long séjour')).toBeInTheDocument();
  });

  it('filters the table by country', () => {
    setup();
    render(<AdminSearchHints />);
    fireEvent.click(screen.getByRole('button', { name: '🇨🇦 CA' }));
    expect(screen.queryByText('france-visas.gouv.fr')).not.toBeInTheDocument();
    expect(screen.getByText('logement')).toBeInTheDocument();
  });

  it('opens the create modal and validates the country/category before submitting', () => {
    setup();
    render(<AdminSearchHints />);
    fireEvent.click(screen.getByText('Nouvelle fiche'));
    expect(screen.getByText('Créer la fiche')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Créer la fiche'));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ countryCode: 'FR', category: 'visa' }));
  });

  it('opens the edit modal pre-filled and locks the country/category selects', () => {
    setup();
    render(<AdminSearchHints />);
    fireEvent.click(screen.getAllByText('Éditer')[0]);
    expect(screen.getByText('Éditer FR/visa')).toBeInTheDocument();
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    expect(selects[0]).toBeDisabled();
    expect(selects[1]).toBeDisabled();
  });

  it('submits an edit with the updated keywords', () => {
    setup();
    render(<AdminSearchHints />);
    fireEvent.click(screen.getAllByText('Éditer')[0]);
    fireEvent.change(screen.getByPlaceholderText('visa long séjour VLS-TS demande'), {
      target: { value: 'nouveau mot-clé' },
    });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ cc: 'FR', cat: 'visa', patch: expect.objectContaining({ keywords: 'nouveau mot-clé' }) }),
    );
  });

  it('closes the modal via the close button', () => {
    setup();
    render(<AdminSearchHints />);
    fireEvent.click(screen.getByText('Nouvelle fiche'));
    fireEvent.click(screen.getByLabelText('Fermer'));
    expect(screen.queryByText('Créer la fiche')).not.toBeInTheDocument();
  });

  it('deletes a hint after confirmation', () => {
    setup();
    render(<AdminSearchHints />);
    fireEvent.click(screen.getAllByText('Supprimer')[0]);
    expect(window.confirm).toHaveBeenCalled();
    expect(mutate).toHaveBeenCalledWith({ cc: 'FR', cat: 'visa' });
  });

  it('does not delete when the confirmation is dismissed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    setup();
    render(<AdminSearchHints />);
    fireEvent.click(screen.getAllByText('Supprimer')[0]);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('triggers the seed restore action', () => {
    setup();
    render(<AdminSearchHints />);
    fireEvent.click(screen.getByText('Restaurer les fiches manquantes'));
    expect(mutate).toHaveBeenCalled();
  });
});
