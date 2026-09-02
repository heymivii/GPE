import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from './dashboard';

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
  default: ({ onStartProject }: { onStartProject: () => void }) => (
    <button onClick={onStartProject}>start-project</button>
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
    const { container } = render(<DashboardPage />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows the welcome dashboard when the user has no projects', () => {
    useProjectsState.isLoading = false;
    useProjectsState.data = [];
    render(<DashboardPage />);
    expect(screen.getByText('start-project')).toBeInTheDocument();
    expect(screen.getByTestId('category-grid')).toBeInTheDocument();
    expect(screen.getByTestId('popular-destinations')).toBeInTheDocument();
  });

  it('navigates to onboarding when starting a project', () => {
    useProjectsState.isLoading = false;
    useProjectsState.data = [];
    render(<DashboardPage />);
    fireEvent.click(screen.getByText('start-project'));
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('redirects to the personalized dashboard once a project exists', async () => {
    useProjectsState.isLoading = false;
    useProjectsState.data = [{ idProject: 1 }];
    render(<DashboardPage />);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/personalized', { replace: true }),
    );
  });
});
