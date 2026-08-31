import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProjectDetailPage from './ProjectDetailPage';
import {
  useProject,
  useDeleteProject,
  useCompleteProject,
  useCancelProject,
  useReactivateProject,
  useUpdateProject,
} from '../hooks/useProjectMutations';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'fr' } }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '7' }),
    useNavigate: () => navigate,
  };
});

vi.mock('../hooks/useProjectMutations', () => ({
  useProject: vi.fn(),
  useDeleteProject: vi.fn(),
  useCompleteProject: vi.fn(),
  useCancelProject: vi.fn(),
  useReactivateProject: vi.fn(),
  useUpdateProject: vi.fn(),
}));

vi.mock('../../documents/DocumentsVault', () => ({
  default: ({ projectId }: any) => <div data-testid="documents-vault">vault-{projectId}</div>,
}));

const mockedUseQuery = vi.mocked(useQuery);
const mockedUseProject = vi.mocked(useProject);
const mockedUseDeleteProject = vi.mocked(useDeleteProject);
const mockedUseCompleteProject = vi.mocked(useCompleteProject);
const mockedUseCancelProject = vi.mocked(useCancelProject);
const mockedUseReactivateProject = vi.mocked(useReactivateProject);
const mockedUseUpdateProject = vi.mocked(useUpdateProject);

const deleteMutate = vi.fn();
const completeMutate = vi.fn();
const cancelMutate = vi.fn();
const reactivateMutate = vi.fn();
const updateMutate = vi.fn();

const baseProject = {
  idProject: 7,
  projectStatus: 'planning',
  createdAt: '2026-01-01T00:00:00Z',
  idDestinationCountry: 1,
  idDestinationCity: null,
  mainObjective: 'work',
  travelType: 'alone',
  expectedDepartureDate: '2026-06-01T00:00:00Z',
  expectedDuration: 12,
  priorities: 'logement,emploi',
  housingBudget: 1200,
  needsSupport: false,
};

function setup(overrides: any = {}) {
  const project = 'project' in overrides ? overrides.project : baseProject;
  mockedUseProject.mockReturnValue({
    data: project,
    isLoading: overrides.isLoading ?? false,
    isError: overrides.isError ?? false,
  } as any);
  mockedUseQuery.mockReturnValue({ data: { countryName: 'France', flagUrl: null } } as any);
  mockedUseDeleteProject.mockReturnValue({ mutate: deleteMutate } as any);
  mockedUseCompleteProject.mockReturnValue({ mutate: completeMutate, isPending: false } as any);
  mockedUseCancelProject.mockReturnValue({ mutate: cancelMutate, isPending: false } as any);
  mockedUseReactivateProject.mockReturnValue({ mutate: reactivateMutate, isPending: false } as any);
  mockedUseUpdateProject.mockReturnValue({ mutate: updateMutate } as any);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectDetailPage />
    </MemoryRouter>,
  );
}

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading spinner while the project is loading', () => {
    setup({ isLoading: true, project: undefined });
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows a not-found state and navigates back on error', () => {
    setup({ isError: true, project: undefined });
    renderPage();
    expect(screen.getByText('projectDetail.notFound')).toBeInTheDocument();
    fireEvent.click(screen.getByText('projectDetail.backToProjects'));
    expect(navigate).toHaveBeenCalledWith('/projects');
  });

  it('renders the project header, status and documents vault', () => {
    setup();
    renderPage();
    expect(screen.getAllByText('France').length).toBeGreaterThan(0);
    expect(screen.getByText('projectDetail.statusPlanning')).toBeInTheDocument();
    expect(screen.getByTestId('documents-vault')).toHaveTextContent('vault-7');
  });

  it('renders the priorities list', () => {
    setup();
    renderPage();
    expect(screen.getByText('logement')).toBeInTheDocument();
    expect(screen.getByText('emploi')).toBeInTheDocument();
  });

  it('shows the action buttons for an active project and hides them once completed', () => {
    setup();
    const { rerender } = renderPage();
    expect(screen.getByText('projectDetail.completeProject')).toBeInTheDocument();

    setup({ project: { ...baseProject, projectStatus: 'completed', completedAt: '2026-05-01T00:00:00Z' } });
    rerender(<MemoryRouter><ProjectDetailPage /></MemoryRouter>);
    expect(screen.queryByText('projectDetail.completeProject')).not.toBeInTheDocument();
    expect(screen.getByText('projectDetail.reactivate')).toBeInTheDocument();
    expect(screen.getByText('projectDetail.completedInfoTitle')).toBeInTheDocument();
  });

  it('opens the delete modal, requires a reason, and deletes then navigates away', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('projectDetail.delete'));
    const confirmButton = screen.getByText('projectDetail.deleteForever');
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'completed' } });
    expect(confirmButton).not.toBeDisabled();
    fireEvent.click(confirmButton);

    expect(deleteMutate).toHaveBeenCalledWith(7, expect.objectContaining({ onSuccess: expect.any(Function) }));
    const onSuccess = deleteMutate.mock.calls[0][1].onSuccess;
    onSuccess();
    expect(navigate).toHaveBeenCalledWith('/projects');
  });

  it('completes the project via the complete modal', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('projectDetail.completeProject'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'successful' } });
    fireEvent.click(screen.getByText('projectDetail.completeConfirm'));
    expect(completeMutate).toHaveBeenCalledWith(
      { projectId: 7, data: { reason: 'successful', feedback: undefined } },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('cancels the project via the cancel modal', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('projectDetail.cancelProject'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'financial' } });
    fireEvent.click(screen.getByText('projectDetail.cancelConfirm'));
    expect(cancelMutate).toHaveBeenCalledWith(
      { projectId: 7, data: { reason: 'financial', details: undefined } },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('reactivates a cancelled project', () => {
    setup({ project: { ...baseProject, projectStatus: 'cancelled', cancelledAt: '2026-03-01T00:00:00Z' } });
    renderPage();
    fireEvent.click(screen.getByText('projectDetail.reactivate'));
    fireEvent.click(screen.getByText('projectDetail.reactivateConfirm'));
    expect(reactivateMutate).toHaveBeenCalledWith(7, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('updates the departure date via the date modal', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('Date de départ'));
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2027-01-15' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(updateMutate).toHaveBeenCalledWith({
      projectId: 7,
      data: { expectedDepartureDate: '2027-01-15' },
    });
  });
});
