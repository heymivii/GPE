import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import DestinationPreview from './DestinationPreview';

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => ({
    countries: [
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'JP', name: 'Japon', flag: '🇯🇵' },
    ],
    nonSelectableCodes: new Set(),
  }),
}));

const mockedUseQuery = vi.mocked(useQuery);

// APERÇU GRATUIT DÉSACTIVÉ : composant entièrement commenté — tests skippés avec lui.
describe.skip('DestinationPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows nothing below the selector before a country is chosen', () => {
    mockedUseQuery.mockReturnValue({ data: undefined, isFetching: false, isError: false } as any);
    render(<DestinationPreview />);
    expect(screen.queryByText(/Voir mon plan personnalisé/)).not.toBeInTheDocument();
  });

  it('shows a loading state while fetching indices', () => {
    mockedUseQuery.mockReturnValue({ data: undefined, isFetching: true, isError: false } as any);
    render(<DestinationPreview />);
    fireEvent.change(screen.getByLabelText('Pays de destination'), { target: { value: 'FR' } });
    expect(screen.getByText(/Analyse de France…/)).toBeInTheDocument();
  });

  it('shows quality-of-life tiles once data has loaded', () => {
    mockedUseQuery.mockReturnValue({
      data: { qualityOfLife: 82, safety: 70, costOfLiving: 55 },
      isFetching: false,
      isError: false,
    } as any);
    render(<DestinationPreview />);
    fireEvent.change(screen.getByLabelText('Pays de destination'), { target: { value: 'FR' } });
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  it('shows an error message when the indices fail to load', () => {
    mockedUseQuery.mockReturnValue({ data: undefined, isFetching: false, isError: true } as any);
    render(<DestinationPreview />);
    fireEvent.change(screen.getByLabelText('Pays de destination'), { target: { value: 'FR' } });
    expect(screen.getByText('Indices indisponibles pour le moment.')).toBeInTheDocument();
  });

  it('navigates to onboarding pre-filled with the chosen destination', () => {
    mockedUseQuery.mockReturnValue({
      data: { qualityOfLife: 82, safety: 70, costOfLiving: 55 },
      isFetching: false,
      isError: false,
    } as any);
    render(<DestinationPreview />);
    fireEvent.change(screen.getByLabelText('Pays de destination'), { target: { value: 'FR' } });
    fireEvent.click(screen.getByText('Voir mon plan personnalisé'));
    expect(navigate).toHaveBeenCalledWith('/onboarding?to=FR');
  });
});
