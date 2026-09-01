import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectSwitcher from './ProjectSwitcher';
import { useProjects } from '../features/projects/hooks/useProjectMutations';
import { useActiveProject } from '../contexts/ActiveProjectContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => opts?.defaultValue ?? key }),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));

vi.mock('../features/projects/hooks/useProjectMutations', () => ({ useProjects: vi.fn() }));
vi.mock('../contexts/ActiveProjectContext', () => ({ useActiveProject: vi.fn() }));

const mockedUseProjects = vi.mocked(useProjects);
const mockedUseActiveProject = vi.mocked(useActiveProject);

const setActiveProjectId = vi.fn();

const projects = [
  { idProject: 1, destinationCountry: { countryName: 'France' } },
  { idProject: 2, destinationCountry: { countryName: 'Canada' } },
];

function setup({ projectsList = projects, activeProjectId = 2 as number | null }: any = {}) {
  mockedUseProjects.mockReturnValue({ data: projectsList } as any);
  mockedUseActiveProject.mockReturnValue({ activeProjectId, setActiveProjectId } as any);
}

describe('ProjectSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there are no projects', () => {
    setup({ projectsList: [] });
    const { container } = render(<ProjectSwitcher />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the active project label', () => {
    setup();
    render(<ProjectSwitcher />);
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('falls back to the most recent project when none is active', () => {
    setup({ activeProjectId: null });
    render(<ProjectSwitcher />);
    expect(setActiveProjectId).toHaveBeenCalledWith(2);
  });

  it('opens the dropdown and lists every project', () => {
    setup();
    render(<ProjectSwitcher />);
    fireEvent.click(screen.getByTitle('Projet actif'));
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('switches to another project and navigates to the personalized dashboard', () => {
    setup();
    render(<ProjectSwitcher />);
    fireEvent.click(screen.getByTitle('Projet actif'));
    fireEvent.click(screen.getByText('France'));
    expect(setActiveProjectId).toHaveBeenCalledWith(1);
    expect(navigate).toHaveBeenCalledWith('/dashboard/personalized?project=1');
  });

  it('navigates to onboarding to start a new project', () => {
    setup();
    render(<ProjectSwitcher />);
    fireEvent.click(screen.getByTitle('Projet actif'));
    fireEvent.click(screen.getByText('Nouveau projet'));
    expect(navigate).toHaveBeenCalledWith('/onboarding');
  });

  it('shows the generic project label when a project has no destination country', () => {
    setup({ projectsList: [{ idProject: 1, destinationCountry: null }], activeProjectId: 1 });
    render(<ProjectSwitcher />);
    expect(screen.getByText('Mon projet')).toBeInTheDocument();
  });
});
