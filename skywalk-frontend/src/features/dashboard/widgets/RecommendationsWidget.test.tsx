import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import RecommendationsWidget from './RecommendationsWidget';
import { useProjectRecommendations } from '../../projects/hooks/useProjectRecommendations';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

vi.mock('../../projects/hooks/useProjectRecommendations', () => ({ useProjectRecommendations: vi.fn() }));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseProjectRecommendations = vi.mocked(useProjectRecommendations);

const emptyRecs = { visa: null, alternativeVisa: null, services: [], actionPlan: [], countryCode: 'FR' };

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseQuery.mockReturnValue({ data: { countryName: 'France' } } as any);
});

describe('RecommendationsWidget', () => {
  it('shows an empty state when there is no active project', () => {
    mockedUseProjectRecommendations.mockReturnValue(emptyRecs as any);
    render(<RecommendationsWidget />);
    expect(screen.getByText('projectRecommendations.subtitle')).toBeInTheDocument();
  });

  it('shows the recommended visa card', () => {
    mockedUseProjectRecommendations.mockReturnValue({
      ...emptyRecs,
      visa: { visaType: 'work', confidence: 'high', reason: 'reason.key', duration: 'oneYear', processing: 'fast' },
    } as any);
    render(<RecommendationsWidget activeProject={{} as any} />);
    expect(screen.getByText('visa.types.work')).toBeInTheDocument();
  });

  it('navigates to visa services when clicking "see details"', () => {
    mockedUseProjectRecommendations.mockReturnValue({
      ...emptyRecs,
      visa: { visaType: 'work', confidence: 'high', reason: 'reason.key', duration: 'oneYear', processing: 'fast' },
    } as any);
    render(<RecommendationsWidget activeProject={{} as any} />);
    fireEvent.click(screen.getByText('projectRecommendations.seeDetails'));
    expect(navigate).toHaveBeenCalledWith('/services/visa?country=FR');
  });

  it('shows action-plan steps and navigates on click', () => {
    mockedUseProjectRecommendations.mockReturnValue({
      ...emptyRecs,
      actionPlan: [{ id: 'step1', icon: '🛂', title: 'Faire le visa', timeline: 'Cette semaine', link: '/services/visa' }],
    } as any);
    render(<RecommendationsWidget activeProject={{} as any} />);
    fireEvent.click(screen.getByText('Faire le visa'));
    expect(navigate).toHaveBeenCalledWith('/services/visa');
  });

  it('shows recommended services and navigates on click', () => {
    mockedUseProjectRecommendations.mockReturnValue({
      ...emptyRecs,
      services: [{ id: 'housing', icon: '🏠', priority: 'high', link: '/services/logement' }],
    } as any);
    render(<RecommendationsWidget activeProject={{} as any} />);
    fireEvent.click(screen.getByText('projectRecommendations.serviceNames.housing'));
    expect(navigate).toHaveBeenCalledWith('/services/logement');
  });
});
