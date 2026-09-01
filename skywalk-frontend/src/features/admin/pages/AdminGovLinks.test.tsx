import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminGovLinks from './AdminGovLinks';

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
const setQueryData = vi.fn();

// Indexed by mutationFn identity (matched via source text): generate, reviewLink, generateCountry, rerun, [EngineCountriesConfig.save]
const mutationMocks = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()];

const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
];

const links = [
  {
    id: 1,
    countryCode: 'FR',
    category: 'visa',
    status: 'pending_review',
    confidence: 0.92,
    url: 'https://france-visas.gouv.fr/some/very/long/path/that/should/truncate',
    verifiedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    countryCode: 'CA',
    category: 'logement',
    status: 'active',
    confidence: 0.8,
    url: 'https://canada.ca/logement',
    verifiedAt: '2026-01-02T00:00:00Z',
  },
];

const engineCountries = [
  { idCountry: 1, countryName: 'France', govLinkEnabled: true, officialDomains: ['gouv.fr'] },
  { idCountry: 2, countryName: 'Canada', govLinkEnabled: false, officialDomains: [] },
];

function setup({
  linksList = links,
  isLoading = false,
  isError = false,
  health = { llm: { ok: true, model: 'gpt' }, search: { ok: true, provider: 'searxng' } },
  latestRun = null,
  polledRun = null,
}: any = {}) {
  mockedUseMutation.mockImplementation(((config: any) => {
    const fnStr = config.mutationFn.toString();
    let idx = -1;
    if (fnStr.includes('generateCountry')) idx = 2;
    else if (fnStr.includes('rerunCategory')) idx = 3;
    else if (fnStr.includes('approveLink') || fnStr.includes('rejectLink')) idx = 1;
    else if (fnStr.includes('govLinksApi.generate(') || fnStr.includes('govLinksApi.generate ')) idx = 0;
    else if (fnStr.includes('countryApi.update')) idx = 4;
    return { mutate: mutationMocks[idx], isPending: false, variables: undefined };
  }) as any);
  mockedUseQueryClient.mockReturnValue({ invalidateQueries, setQueryData } as any);
  mockedUseQuery.mockImplementation((opts: any) => {
    const key = opts.queryKey[0];
    if (key === 'gov-links-supported-countries') return { data: countries } as any;
    if (key === 'gov-links-health') return { data: health } as any;
    if (key === 'admin-gov-links') return { data: linksList, isLoading, isError } as any;
    if (key === 'admin-countries-engine') return { data: engineCountries } as any;
    if (key === 'gov-run-latest') return { data: latestRun, isLoading: false } as any;
    if (key === 'gov-run') return { data: polledRun, refetch: vi.fn() } as any;
    return { data: undefined } as any;
  });
}

describe('AdminGovLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state on the links tab', () => {
    setup({ isLoading: true });
    const { container } = render(<AdminGovLinks />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows an error state when the links query fails', () => {
    setup({ isError: true });
    render(<AdminGovLinks />);
    expect(screen.getByText(/Erreur lors du chargement des liens/)).toBeInTheDocument();
  });

  it('shows an empty state when there are no links', () => {
    setup({ linksList: [] });
    render(<AdminGovLinks />);
    expect(screen.getByText(/Aucun lien/)).toBeInTheDocument();
  });

  it('lists links with their status and truncated url', () => {
    setup();
    render(<AdminGovLinks />);
    expect(screen.getByText('À valider')).toBeInTheDocument();
    expect(screen.getByText('Publié')).toBeInTheDocument();
  });

  it('filters links by country', () => {
    setup();
    render(<AdminGovLinks />);
    fireEvent.change(screen.getByDisplayValue('🌍 Tous les pays'), { target: { value: 'CA' } });
    expect(screen.queryByText('À valider')).not.toBeInTheDocument();
    expect(screen.getByText('Publié')).toBeInTheDocument();
  });

  it('shows the health indicator as red when the search engine is down', () => {
    setup({ health: { llm: { ok: true, model: 'gpt' }, search: { ok: false, provider: 'searxng' } } });
    render(<AdminGovLinks />);
    expect(screen.getByText(/Moteur de recherche.*injoignable/)).toBeInTheDocument();
  });

  it('generates a link for the selected country/category', () => {
    setup();
    render(<AdminGovLinks />);
    fireEvent.click(screen.getByText('Générer'));
    expect(mutationMocks[0]).toHaveBeenCalledWith({ country: 'FR', category: 'visa' });
  });

  it('approves a pending link', () => {
    setup();
    render(<AdminGovLinks />);
    fireEvent.click(screen.getByText('Valider'));
    expect(mutationMocks[1]).toHaveBeenCalledWith({ id: 1, approve: true });
  });

  it('rejects a pending link', () => {
    setup();
    render(<AdminGovLinks />);
    const rejectButtons = screen.getAllByRole('button').filter((b) => b.title?.startsWith('Rejeter'));
    fireEvent.click(rejectButtons[0]);
    expect(mutationMocks[1]).toHaveBeenCalledWith({ id: 1, approve: false });
  });

  it('regenerates a link from its row', () => {
    setup();
    render(<AdminGovLinks />);
    fireEvent.click(screen.getAllByText('Régénérer')[0]);
    expect(mutationMocks[0]).toHaveBeenCalledWith({ country: 'FR', category: 'visa' });
  });

  it('switches to the "runs" tab and shows the no-run message', () => {
    setup();
    render(<AdminGovLinks />);
    fireEvent.click(screen.getByText('Génération par pays'));
    expect(screen.getByText(/Aucun run pour FR/)).toBeInTheDocument();
  });

  it('launches a country-wide generation run', () => {
    setup();
    render(<AdminGovLinks />);
    fireEvent.click(screen.getByText('Génération par pays'));
    fireEvent.click(screen.getByText('Générer pour FR'));
    expect(mutationMocks[2]).toHaveBeenCalledWith('FR');
  });

  it('displays run progress and results once a run is loaded', () => {
    setup({
      latestRun: {
        id: 5,
        status: 'done',
        startedAt: '2026-01-01T00:00:00Z',
        finishedAt: '2026-01-01T00:05:00Z',
        total: 2,
        results: [
          { category: 'visa', result: 'verified', url: 'https://gouv.fr/visa', confidence: 0.9, message: null },
          { category: 'logement', result: null, url: null, confidence: null, message: null },
        ],
      },
    });
    render(<AdminGovLinks />);
    fireEvent.click(screen.getByText('Génération par pays'));
    expect(screen.getByText('Run #5')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('reruns a single category from an active run', () => {
    setup({
      latestRun: {
        id: 5,
        status: 'done',
        startedAt: '2026-01-01T00:00:00Z',
        total: 1,
        results: [{ category: 'visa', result: 'failed', url: null, confidence: null, message: 'timeout' }],
      },
    });
    render(<AdminGovLinks />);
    fireEvent.click(screen.getByText('Génération par pays'));
    fireEvent.click(screen.getByText('Relancer'));
    expect(mutationMocks[3]).toHaveBeenCalledWith({ runId: 5, category: 'visa' });
  });

  it('expands the engine countries config and saves a country config', () => {
    setup();
    render(<AdminGovLinks />);
    fireEvent.click(screen.getByText('Génération par pays'));
    fireEvent.click(screen.getByText(/Pays gérés par le moteur/));
    fireEvent.click(screen.getAllByText('Enregistrer')[0]);
    expect(mutationMocks[4]).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, enabled: true }),
    );
  });
});
