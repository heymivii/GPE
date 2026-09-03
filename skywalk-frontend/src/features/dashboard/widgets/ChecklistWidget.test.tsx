import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChecklistWidget from './ChecklistWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.days != null) return `J-${opts.days}`;
      return key.split('.').pop() ?? key;
    },
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../../../data/checklist-links', () => ({
  getLinksForStep: () => null,
}));

vi.mock('../hooks/useChecklistProgress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useChecklistProgress')>();
  return { ...actual, useChecklistProgress: vi.fn() };
});

import { useChecklistProgress } from '../hooks/useChecklistProgress';
const mockedUseProgress = vi.mocked(useChecklistProgress);

const updateStep = vi.fn();
const updateFacts = vi.fn();

function renderWidget(props: Partial<React.ComponentProps<typeof ChecklistWidget>> = {}) {
  return render(
    <MemoryRouter>
      <ChecklistWidget countryData={null} projectId={1} {...props} />
    </MemoryRouter>,
  );
}

const tracking = (overrides: any = {}) => ({
  idProcedureTracking: 1,
  status: 'not_started',
  completedFacts: [],
  admin_procedure: {
    procedureType: 'Visa',
    category: 'visa',
    phase: 'before',
    daysBeforeDeparture: 30,
    actionItems: [],
  },
  ...overrides,
});

describe('ChecklistWidget', () => {
  beforeEach(() => {
    updateStep.mockReset().mockResolvedValue(undefined);
    updateFacts.mockReset().mockResolvedValue(undefined);
    mockedUseProgress.mockReturnValue({
      progress: [],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a spinner while loading', () => {
    mockedUseProgress.mockReturnValue({
      progress: [],
      updateStep,
      updateFacts,
      isLoading: true,
    } as any);
    const { container } = renderWidget();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an empty state when there are no checklist items', () => {
    renderWidget();
    expect(screen.getByText('emptyState')).toBeInTheDocument();
  });

  it('computes before/arrival progress independently (no cross-phase mixing)', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({ idProcedureTracking: 1, status: 'completed', admin_procedure: { procedureType: 'A', category: 'visa', phase: 'before', actionItems: [] } }),
        tracking({ idProcedureTracking: 2, status: 'not_started', admin_procedure: { procedureType: 'B', category: 'visa', phase: 'before', actionItems: [] } }),
        tracking({ idProcedureTracking: 3, status: 'completed', admin_procedure: { procedureType: 'C', category: 'logement', phase: 'on_arrival', actionItems: [] } }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget();
    expect(screen.getByText('1/2')).toBeInTheDocument(); // before: 1 of 2 done
    expect(screen.getByText('1/1')).toBeInTheDocument(); // arrival: 1 of 1 done
  });

  it('shows the priority preview only for late/urgent before-departure steps, sorted late-first', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 1,
          admin_procedure: { procedureType: 'Urgent step', category: 'visa', phase: 'before', daysBeforeDeparture: 5, actionItems: [] },
        }),
        tracking({
          idProcedureTracking: 2,
          admin_procedure: { procedureType: 'Late step', category: 'visa', phase: 'before', daysBeforeDeparture: 100, actionItems: [] },
        }),
        tracking({
          idProcedureTracking: 3,
          admin_procedure: { procedureType: 'Arrival step', category: 'logement', phase: 'on_arrival', daysBeforeDeparture: 5, actionItems: [] },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget({ project: { expectedDepartureDate: '2026-01-10T00:00:00Z' } as any });

    const preview = screen.getByText('priorityToDo').parentElement!;
    const titles = within(preview)
      .getAllByText(/step/i)
      .map((el) => el.textContent);
    expect(titles[0]).toBe('Late step'); // overdue deadline sorts first
    expect(titles).toContain('Urgent step');
    expect(titles).not.toContain('Arrival step'); // on_arrival never enters the urgent preview
  });

  it('sorts two non-late urgent steps by days remaining when neither is overdue', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    mockedUseProgress.mockReturnValue({
      progress: [
        // deadline 2026-01-15 → 14 days left (urgent, not late)
        tracking({
          idProcedureTracking: 1,
          admin_procedure: { procedureType: 'Step far', category: 'visa', phase: 'before', daysBeforeDeparture: 5, actionItems: [] },
        }),
        // deadline 2026-01-05 → 4 days left (urgent, not late) — closer, should sort first
        tracking({
          idProcedureTracking: 2,
          admin_procedure: { procedureType: 'Step near', category: 'visa', phase: 'before', daysBeforeDeparture: 15, actionItems: [] },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget({ project: { expectedDepartureDate: '2026-01-20T00:00:00Z' } as any });

    const preview = screen.getByText('priorityToDo').parentElement!;
    const titles = within(preview)
      .getAllByText(/step/i)
      .map((el) => el.textContent);
    expect(titles[0]).toBe('Step near');
    expect(titles[1]).toBe('Step far');
  });

  it('does not duplicate a priority-preview item in the full list below', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 1,
          admin_procedure: { procedureType: 'Urgent step', category: 'visa', phase: 'before', daysBeforeDeparture: 100, actionItems: [] },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget({ project: { expectedDepartureDate: '2026-01-10T00:00:00Z' } as any });
    expect(screen.getAllByText('Urgent step')).toHaveLength(1);
  });

  it('toggles a step completion status when its circle icon is clicked', async () => {
    mockedUseProgress.mockReturnValue({
      progress: [tracking({ idProcedureTracking: 5 })],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget();
    const checkButtons = document.querySelectorAll('button');
    const toggleBtn = Array.from(checkButtons).find((b) => b.querySelector('svg.lucide-circle'));
    fireEvent.click(toggleBtn!);

    await waitFor(() =>
      expect(updateStep).toHaveBeenCalledWith({ trackingId: 5, status: 'completed' }),
    );
  });

  it('toggles a substep and sends the updated completedFacts array', async () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 7,
          completedFacts: [0],
          admin_procedure: {
            procedureType: 'With substeps',
            category: 'visa',
            phase: 'before',
            daysBeforeDeparture: 30,
            actionItems: ['Do A', 'Do B'],
          },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget();

    // Expand the item (chevron button) to reveal substeps — scope to the chevron icon
    // specifically, since the widget's own "..." menu button also carries the p-1 class.
    const expandBtn = document.querySelector('button:has(svg.lucide-chevron-right)');
    fireEvent.click(expandBtn!);

    const substep = screen.getByText('Do B');
    fireEvent.click(substep);

    await waitFor(() =>
      expect(updateFacts).toHaveBeenCalledWith({ trackingId: 7, completedFacts: [0, 1] }),
    );
  });

  it('unchecks a substep, removing it from completedFacts', async () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 7,
          completedFacts: [0, 1],
          admin_procedure: {
            procedureType: 'With substeps',
            category: 'visa',
            phase: 'before',
            daysBeforeDeparture: 30,
            actionItems: ['Do A', 'Do B'],
          },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget();

    const expandBtn = document.querySelector('button:has(svg.lucide-chevron-right)');
    fireEvent.click(expandBtn!);
    fireEvent.click(screen.getByText('Do B'));

    await waitFor(() =>
      expect(updateFacts).toHaveBeenCalledWith({ trackingId: 7, completedFacts: [0] }),
    );
  });

  it('collapses the substeps list on a second expand-toggle click', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 7,
          admin_procedure: {
            procedureType: 'With substeps',
            category: 'visa',
            phase: 'before',
            daysBeforeDeparture: 30,
            actionItems: ['Do A'],
          },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget();

    const expandBtn = document.querySelector('button:has(svg.lucide-chevron-right)')! as HTMLElement;
    fireEvent.click(expandBtn);
    expect(screen.getByText('Do A')).toBeInTheDocument();
    fireEvent.click(document.querySelector('button:has(svg.lucide-chevron-down)')!);
    expect(screen.queryByText('Do A')).not.toBeInTheDocument();
  });

  it('logs an error without crashing when updateStep rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    updateStep.mockRejectedValueOnce(new Error('network'));
    mockedUseProgress.mockReturnValue({
      progress: [tracking({ idProcedureTracking: 5 })],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget();
    const toggleBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.querySelector('svg.lucide-circle'),
    );
    fireEvent.click(toggleBtn!);

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    errorSpy.mockRestore();
  });

  it('logs an error without crashing when updateFacts rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    updateFacts.mockRejectedValueOnce(new Error('network'));
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 7,
          admin_procedure: {
            procedureType: 'With substeps',
            category: 'visa',
            phase: 'before',
            daysBeforeDeparture: 30,
            actionItems: ['Do A'],
          },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget();
    fireEvent.click(document.querySelector('button:has(svg.lucide-chevron-right)')!);
    fireEvent.click(screen.getByText('Do A'));

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    errorSpy.mockRestore();
  });

  it('shows a warning when the project has no departure date', () => {
    mockedUseProgress.mockReturnValue({
      progress: [tracking()],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget({ project: {} as any });
    expect(screen.getByText('missingDepartureDate')).toBeInTheDocument();
  });

  // PRICING DÉSACTIVÉ : plus de verrou — un projet non payé voit le lien complet.
  it('shows the full-checklist link even when the project is unpaid (pricing désactivé)', () => {
    mockedUseProgress.mockReturnValue({
      progress: [tracking()],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget({ project: { idProject: 9, isPaid: false } as any });

    expect(screen.queryByText('Débloquez votre plan complet')).not.toBeInTheDocument();
    expect(screen.getByText('seeFullChecklist')).toBeInTheDocument();
  });

  it('shows the full-checklist link when the project is paid', () => {
    mockedUseProgress.mockReturnValue({
      progress: [tracking()],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget({ project: { idProject: 9, isPaid: true } as any });

    expect(screen.getByText('seeFullChecklist')).toBeInTheDocument();
    expect(screen.queryByText('Débloquez votre plan complet')).not.toBeInTheDocument();
  });

  it('filters out steps not applicable to the project travelType', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          admin_procedure: {
            procedureType: 'Family-only step',
            category: 'visa',
            phase: 'before',
            actionItems: [],
            onlyFor: { travelType: ['family'] },
          },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderWidget({ project: { travelType: 'alone' } as any });
    expect(screen.getByText('emptyState')).toBeInTheDocument();
  });
});
