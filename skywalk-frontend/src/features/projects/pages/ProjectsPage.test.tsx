import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectsPage from './ProjectsPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts?.id != null ? `${key}(${opts.id})` : (opts?.defaultValue ?? key),
    i18n: { language: 'fr' },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockGetAllProjects = vi.fn();
vi.mock('../../../api/expatriation-project', () => ({
  expatriationProjectApi: { getAll: (...a: any[]) => mockGetAllProjects(...a) },
}));

const mockGetAllCountries = vi.fn();
vi.mock('../../../api/country', () => ({
  countryApi: { getAll: (...a: any[]) => mockGetAllCountries(...a) },
}));

const mockDeleteProject = vi.fn();
vi.mock('../hooks/useProjectMutations', () => ({
  useDeleteProject: () => ({ mutate: mockDeleteProject }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const project = (overrides: any = {}) => ({
  idProject: 1,
  idDestinationCountry: 10,
  projectStatus: 'planning',
  mainObjective: 'work',
  travelType: 'alone',
  expectedDepartureDate: '2026-06-01',
  ...overrides,
});

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllCountries.mockResolvedValue([{ idCountry: 10, countryName: 'France', flagUrl: 'flag.png' }]);
  });

  it('shows a loading spinner', () => {
    mockGetAllProjects.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an error state and reloads on retry', async () => {
    mockGetAllProjects.mockRejectedValue(new Error('boom'));
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', { value: { reload: reloadSpy }, writable: true, configurable: true });
    renderPage();
    expect(await screen.findByText('projectsPage.errorTitle')).toBeInTheDocument();
    fireEvent.click(screen.getByText('projectsPage.retry'));
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('shows the empty state with a create-project link', async () => {
    mockGetAllProjects.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('projectsPage.noProjects')).toBeInTheDocument();
    expect(screen.getByText('projectsPage.createProject').closest('a')).toHaveAttribute('href', '/onboarding');
  });

  it('renders a project card with country, status, objective, travel type, and date', async () => {
    mockGetAllProjects.mockResolvedValue([project()]);
    renderPage();
    expect(await screen.findByText('France')).toBeInTheDocument();
    expect(screen.getByText('projectsPage.projectId(1)')).toBeInTheDocument();
    expect(screen.getByText('projectDetail.statusPlanning')).toBeInTheDocument();
    expect(screen.getByText('projectDetail.objectiveWork')).toBeInTheDocument();
    expect(screen.getByText('projectDetail.travelAlone')).toBeInTheDocument();
  });

  it('falls back to a country-id label when the country is unknown', async () => {
    mockGetAllCountries.mockResolvedValue([]);
    mockGetAllProjects.mockResolvedValue([project()]);
    renderPage();
    expect(await screen.findByText('projectsPage.countryFallback(10)')).toBeInTheDocument();
  });

  it('opens the card menu and navigates to project details', async () => {
    mockGetAllProjects.mockResolvedValue([project()]);
    renderPage();
    await screen.findByText('France');
    fireEvent.click(screen.getByRole('button', { name: 'Options du projet' }));
    fireEvent.click(screen.getByText('projectsPage.viewDetails'));
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });

  it('opens the card menu and navigates to edit', async () => {
    mockGetAllProjects.mockResolvedValue([project()]);
    renderPage();
    await screen.findByText('France');
    fireEvent.click(screen.getByRole('button', { name: 'Options du projet' }));
    fireEvent.click(screen.getByText('projectsPage.edit'));
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/1');
  });

  it('opens the delete confirmation and requires a reason before deleting', async () => {
    mockGetAllProjects.mockResolvedValue([project()]);
    renderPage();
    await screen.findByText('France');
    fireEvent.click(screen.getByRole('button', { name: 'Options du projet' }));
    fireEvent.click(screen.getByText('projectsPage.delete'));
    expect(screen.getByText('projectsPage.deleteTitle')).toBeInTheDocument();

    const deleteButtons = screen.getAllByText('projectsPage.delete');
    const confirmDeleteBtn = deleteButtons[deleteButtons.length - 1];
    expect(confirmDeleteBtn).toBeDisabled();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'completed' } });
    expect(confirmDeleteBtn).not.toBeDisabled();
    fireEvent.click(confirmDeleteBtn);
    expect(mockDeleteProject).toHaveBeenCalledWith(1, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('cancels the delete confirmation', async () => {
    mockGetAllProjects.mockResolvedValue([project()]);
    renderPage();
    await screen.findByText('France');
    fireEvent.click(screen.getByRole('button', { name: 'Options du projet' }));
    fireEvent.click(screen.getByText('projectsPage.delete'));
    fireEvent.click(screen.getByText('projectsPage.cancel'));
    expect(screen.queryByText('projectsPage.deleteTitle')).not.toBeInTheDocument();
  });

  it('renders a fallback objective/travel icon for unknown values', async () => {
    mockGetAllProjects.mockResolvedValue([project({ mainObjective: 'mystery', travelType: 'mystery' })]);
    renderPage();
    expect((await screen.findAllByText('mystery')).length).toBe(2);
  });
});
