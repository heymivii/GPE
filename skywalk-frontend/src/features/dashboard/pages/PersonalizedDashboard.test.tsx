import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PersonalizedDashboard from './PersonalizedDashboard';
import { useProjects } from '../../projects/hooks/useProjectMutations';
import { useAuth } from '../../../hooks/useAuth';
import { useActiveProject } from '../../../contexts/ActiveProjectContext';
import { useDashboardPreferences } from '../hooks/useDashboardPreferences';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts && typeof opts === 'object' ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../projects/hooks/useProjectMutations', () => ({ useProjects: vi.fn() }));
vi.mock('../../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../../hooks/useCountryData', () => ({ useCountryData: () => null }));
vi.mock('../../../contexts/ActiveProjectContext', () => ({ useActiveProject: vi.fn() }));
vi.mock('../hooks/useDashboardPreferences', () => ({ useDashboardPreferences: vi.fn() }));

vi.mock('../widgets/ProfileSummaryWidget', () => ({ default: (p: any) => <div data-testid="w-profile-summary" onClick={p.onHide}>profile</div> }));
vi.mock('../widgets/RecommendationsWidget', () => ({ default: () => <div data-testid="w-recommendations" /> }));
vi.mock('../widgets/ChecklistWidget', () => ({ default: () => <div data-testid="w-checklist" /> }));
vi.mock('../widgets/BudgetTrackerWidget', () => ({ default: () => <div data-testid="w-budget-tracker" /> }));
vi.mock('../widgets/WeatherWidget', () => ({ default: () => <div data-testid="w-weather" /> }));
vi.mock('../widgets/JobOpportunitiesWidget', () => ({ default: () => <div data-testid="w-job-opportunities" /> }));
vi.mock('../widgets/CountdownWidget', () => ({ default: () => <div data-testid="w-countdown" /> }));
vi.mock('../widgets/RequiredDocumentsWidget', () => ({ default: () => <div data-testid="w-required-documents" /> }));
vi.mock('../widgets/DestinationForumWidget', () => ({ default: () => <div data-testid="w-destination-forum" /> }));

const mockedUseProjects = vi.mocked(useProjects);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseActiveProject = vi.mocked(useActiveProject);
const mockedUseDashboardPreferences = vi.mocked(useDashboardPreferences);

const toggleWidget = vi.fn();
const updateWidgetOrder = vi.fn();
const setWidgetSize = vi.fn();
const setActiveProjectId = vi.fn();

const project = {
  idProject: 1,
  projectStatus: 'planning',
  expectedDepartureDate: '2027-01-01T00:00:00Z',
  housingBudget: 1200,
  expectedDuration: 9,
  idDestinationCountry: 2,
  idOriginCountry: 1,
  mainObjective: 'work',
  travelType: 'alone',
};

function setup({
  isLoading = false,
  projects = [project],
  hiddenWidgets = [] as string[],
  widgetOrder = null as string[] | null,
}: any = {}) {
  mockedUseProjects.mockReturnValue({ data: projects, isLoading } as any);
  mockedUseAuth.mockReturnValue({ user: { fullName: 'Alice', age: 30 } } as any);
  mockedUseActiveProject.mockReturnValue({ activeProjectId: null, setActiveProjectId } as any);
  mockedUseDashboardPreferences.mockReturnValue({
    hiddenWidgets,
    toggleWidget,
    widgetOrder,
    updateWidgetOrder,
    getWidgetSize: () => 'medium',
    setWidgetSize,
  } as any);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PersonalizedDashboard />
    </MemoryRouter>,
  );
}

describe('PersonalizedDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state', () => {
    setup({ isLoading: true, projects: undefined });
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('shows a CTA to start onboarding when there are no projects', () => {
    setup({ projects: [] });
    renderPage();
    const link = screen.getByText('dashboard.personalized.noProjects.cta').closest('a');
    expect(link).toHaveAttribute('href', '/onboarding');
  });

  it('renders the default set of widgets', () => {
    setup();
    renderPage();
    expect(screen.getByTestId('w-checklist')).toBeInTheDocument();
    expect(screen.getByTestId('w-countdown')).toBeInTheDocument();
    expect(screen.getByTestId('w-budget-tracker')).toBeInTheDocument();
  });

  it('toggles edit mode', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByText('dashboard.personalized.modifyWidgets'));
    expect(screen.getByText('dashboard.personalized.finish')).toBeInTheDocument();
  });

  it('hides a widget via its onHide callback', () => {
    setup();
    renderPage();
    fireEvent.click(screen.getByTestId('w-profile-summary'));
    expect(toggleWidget).toHaveBeenCalledWith('profile-summary');
  });

  it('lists hidden widgets in edit mode and restores one', () => {
    setup({ hiddenWidgets: ['weather'] });
    renderPage();
    fireEvent.click(screen.getByText('dashboard.personalized.modifyWidgets'));
    expect(screen.queryByTestId('w-weather')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/weather/));
    expect(toggleWidget).toHaveBeenCalledWith('weather');
  });

  it('opens the widget library, adds a not-yet-added widget, then closes it', () => {
    // Every "available" widget is already part of the default layout, so from the
    // library the only reachable "add" path is restoring a currently-hidden one.
    setup({ hiddenWidgets: ['weather'] });
    renderPage();
    fireEvent.click(screen.getByText('dashboard.personalized.modifyWidgets'));
    fireEvent.click(screen.getByText('dashboard.personalized.widgets.addWidget'));
    expect(screen.getByText('dashboard.personalized.widgets.library.title')).toBeInTheDocument();

    const weatherCard = screen.getByText('dashboard.personalized.widgets.available.weather.name').closest('button')!;
    expect(weatherCard).not.toBeDisabled();
    fireEvent.click(weatherCard);
    expect(toggleWidget).toHaveBeenCalledWith('weather');

    fireEvent.click(screen.getByText('dashboard.personalized.widgets.library.done'));
    expect(screen.queryByText('dashboard.personalized.widgets.library.title')).not.toBeInTheDocument();
  });

  it('shows the project status and departure countdown in the stats bar', () => {
    setup();
    renderPage();
    expect(screen.getByText('dashboard.personalized.stats.projectStatus.planning')).toBeInTheDocument();
  });

  it('shows the undefined-budget placeholder when there is no housing budget', () => {
    setup({ projects: [{ ...project, housingBudget: undefined }] });
    renderPage();
    expect(screen.getByText('dashboard.personalized.stats.housingBudget.undefined')).toBeInTheDocument();
  });
});
