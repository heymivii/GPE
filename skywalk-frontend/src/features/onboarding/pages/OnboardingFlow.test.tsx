import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import OnboardingFlow from './OnboardingFlow';
import useOnboarding from '../hooks/useOnboarding';
import { useAuth } from '../../../hooks/useAuth';
import { useCreateProject, useUpdateProject, useProjects } from '../../projects/hooks/useProjectMutations';
import { userApi } from '../../../api/user';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => (opts ? `${key}:${JSON.stringify(opts)}` : key) }),
}));

vi.mock('react-hot-toast', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const navigate = vi.fn();
let searchParamsState = new URLSearchParams();
const setSearchParams = vi.fn((updater: any) => {
  searchParamsState = typeof updater === 'function' ? updater(searchParamsState) : updater;
});
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
    useParams: () => ({ id: undefined }),
    useSearchParams: () => [searchParamsState, setSearchParams],
  };
});

vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../hooks/useOnboarding', () => ({ default: vi.fn() }));
vi.mock('../../projects/hooks/useProjectMutations', () => ({
  useCreateProject: vi.fn(),
  useUpdateProject: vi.fn(),
  useProjects: vi.fn(),
}));
vi.mock('../../../hooks/useCountryData', () => ({
  useCountryData: () => null,
  useCountryDataByCode: () => null,
}));
vi.mock('../../../api/user', () => ({
  userApi: { updateProfile: vi.fn() },
}));

vi.mock('../components/OnboardingLayout', () => ({
  default: ({ children }: any) => <div data-testid="onboarding-layout">{children}</div>,
}));
vi.mock('../pages/DestinationStep', () => ({
  default: (p: any) => <div data-testid="destination-step" onClick={() => p.onNext({ toCountry: 'CA', fromCountry: 'FR' })}>destination</div>,
}));
vi.mock('../pages/ProfileStep', () => ({ default: () => <div data-testid="profile-step" /> }));
vi.mock('../pages/ObjectiveStep', () => ({ default: () => <div data-testid="objective-step" /> }));
vi.mock('../pages/PreparationStep', () => ({ default: () => <div data-testid="preparation-step" /> }));
vi.mock('../pages/NeedsStep', () => ({ default: () => <div data-testid="needs-step" /> }));
vi.mock('../pages/SummaryStep', () => ({
  default: (p: any) => (
    <div data-testid="summary-step">
      <button onClick={p.onComplete}>complete</button>
    </div>
  ),
}));
vi.mock('../pages/AuthGateStep', () => ({ default: () => <div data-testid="auth-gate-step" /> }));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseOnboarding = vi.mocked(useOnboarding);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseCreateProject = vi.mocked(useCreateProject);
const mockedUseUpdateProject = vi.mocked(useUpdateProject);
const mockedUseProjects = vi.mocked(useProjects);

const createProject = vi.fn();
const updateProject = vi.fn();
const updateStepData = vi.fn();
const setAllData = vi.fn();
const nextStep = vi.fn();
const prevStep = vi.fn();
const goToStep = vi.fn();
const clearDraft = vi.fn();

const countries = [
  { idCountry: 1, isoCode: 'FR', countryName: 'France' },
  { idCountry: 2, isoCode: 'CA', countryName: 'Canada' },
];

function setup({
  currentStep = 1,
  data = {},
  isAuthenticated = true,
}: { currentStep?: number; data?: any; isAuthenticated?: boolean } = {}) {
  searchParamsState = new URLSearchParams();
  mockedUseQuery.mockReturnValue({ data: countries } as any);
  mockedUseOnboarding.mockReturnValue({
    currentStep,
    data,
    updateStepData,
    setAllData,
    nextStep,
    prevStep,
    goToStep,
    getSteps: () => [],
    canGoToStep: () => true,
    clearDraft,
  } as any);
  mockedUseAuth.mockReturnValue({
    isAuthenticated,
    isLoading: false,
    refreshUser: vi.fn().mockResolvedValue(undefined),
    user: isAuthenticated ? { countryOriginId: 1, age: 30 } : null,
  } as any);
  mockedUseCreateProject.mockReturnValue({ mutateAsync: createProject, isPending: false } as any);
  mockedUseUpdateProject.mockReturnValue({ mutateAsync: updateProject, isPending: false } as any);
  mockedUseProjects.mockReturnValue({ data: [] } as any);
}

describe('OnboardingFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the destination step by default', () => {
    setup({ currentStep: 1 });
    render(<OnboardingFlow />);
    expect(screen.getByTestId('destination-step')).toBeInTheDocument();
  });

  it('renders the matching step component for each step number', () => {
    setup({ currentStep: 3 });
    render(<OnboardingFlow />);
    expect(screen.getByTestId('objective-step')).toBeInTheDocument();
  });

  it('renders the summary step on step 6', () => {
    setup({ currentStep: 6 });
    render(<OnboardingFlow />);
    expect(screen.getByTestId('summary-step')).toBeInTheDocument();
  });

  it('shows the auth gate instead of completing when the user is unauthenticated', async () => {
    setup({ currentStep: 6, isAuthenticated: false, data: { destination: { toCountry: 'CA', fromCountry: 'FR' } } });
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByText('complete'));
    expect(await screen.findByTestId('auth-gate-step')).toBeInTheDocument();
    expect(createProject).not.toHaveBeenCalled();
  });

  it('shows an error toast and does not create a project when the destination country is invalid', async () => {
    setup({ currentStep: 6, data: { destination: { toCountry: 'ATLANTIDE', fromCountry: 'FR' } } });
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByText('complete'));
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith('onboarding.invalidDestination'));
    expect(createProject).not.toHaveBeenCalled();
  });

  it('creates a project, saves local flags and navigates to /projects on completion', async () => {
    createProject.mockResolvedValue(undefined);
    vi.mocked(userApi.updateProfile).mockResolvedValue({} as any);
    setup({
      currentStep: 6,
      data: {
        destination: { toCountry: 'CA', fromCountry: 'FR' },
        profile: { age: '30', travelParty: 'alone' },
        objective: { goal: 'work', stayDuration: '6_12_months' },
      },
    });
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByText('complete'));
    await vi.waitFor(() => expect(createProject).toHaveBeenCalled());
    expect(createProject).toHaveBeenCalledWith(expect.objectContaining({ idDestinationCountry: 2 }));
    expect(localStorage.getItem('skywalk-onboarding-completed')).toBe('true');
    expect(clearDraft).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/projects');
  });

  it('shows a generic error toast when project creation fails', async () => {
    createProject.mockRejectedValue(new Error('network down'));
    setup({
      currentStep: 6,
      data: { destination: { toCountry: 'CA', fromCountry: 'FR' } },
    });
    render(<OnboardingFlow />);
    fireEvent.click(screen.getByText('complete'));
    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('onboarding.errorPrefix: network down'),
    );
    expect(navigate).not.toHaveBeenCalled();
  });
});
