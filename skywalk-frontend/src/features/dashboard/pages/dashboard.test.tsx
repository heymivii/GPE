import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './dashboard';

// Le dashboard lit le profil courant pour savoir s'il est complet.
const mockUser = vi.fn(() => ({ user: null }));
vi.mock('../../../hooks/useAuth', () => ({ useAuth: () => mockUser() }));

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const useProjectsState: { data: any; isLoading: boolean } = { data: undefined, isLoading: true };
vi.mock('../../projects/hooks/useProjectMutations', () => ({
  useProjects: () => useProjectsState,
}));

vi.mock('../components/WelcomeSection', () => ({
  default: ({
    onStartProject,
    isProfileComplete,
  }: {
    onStartProject: () => void;
    isProfileComplete?: boolean;
  }) => (
    <div data-testid="welcome" data-profile-complete={String(isProfileComplete)}>
      <button onClick={onStartProject}>start-project</button>
    </div>
  ),
}));
vi.mock('../components/CategoryGrid', () => ({ default: () => <div data-testid="category-grid" /> }));
vi.mock('../components/PopularDestinations', () => ({
  default: () => <div data-testid="popular-destinations" />,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectsState.data = undefined;
    useProjectsState.isLoading = true;
  });

  it('shows a spinner while loading', () => {
    useProjectsState.isLoading = true;
    const { container } = renderDashboard();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows the welcome dashboard when the user has no projects', () => {
    useProjectsState.isLoading = false;
    useProjectsState.data = [];
    renderDashboard();
    expect(screen.getByText('start-project')).toBeInTheDocument();
    expect(screen.getByTestId('category-grid')).toBeInTheDocument();
    expect(screen.getByTestId('popular-destinations')).toBeInTheDocument();
  });

  it('navigates to onboarding when starting a project', () => {
    useProjectsState.isLoading = false;
    useProjectsState.data = [];
    renderDashboard();
    fireEvent.click(screen.getByText('start-project'));
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('redirects to the personalized dashboard once a project exists', async () => {
    useProjectsState.isLoading = false;
    useProjectsState.data = [{ idProject: 1 }];
    renderDashboard();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/personalized', { replace: true }),
    );
  });

  it('annonce un profil complet quand toutes les informations sont là', () => {
    // `isProfileComplete` était codé en dur à false : l'alerte s'affichait
    // même à quelqu'un ayant tout rempli.
    useProjectsState.isLoading = false;
    useProjectsState.data = [];
    mockUser.mockReturnValue({
      user: { age: 30, status: 'student', countryOriginId: 1, languageLevel: 'B2' },
    } as any);

    renderDashboard();

    expect(screen.getByTestId('welcome')).toHaveAttribute('data-profile-complete', 'true');
  });

  it('annonce un profil incomplet quand il manque des informations', () => {
    useProjectsState.isLoading = false;
    useProjectsState.data = [];
    mockUser.mockReturnValue({ user: { age: 30, status: 'student' } } as any);

    renderDashboard();

    expect(screen.getByTestId('welcome')).toHaveAttribute('data-profile-complete', 'false');
  });
});
