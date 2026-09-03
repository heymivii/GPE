import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChecklistPage from './ChecklistPage';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useParams: () => ({ id: '1' }) };
});

vi.mock('../hooks/useProjectMutations', () => ({
  useProject: vi.fn(),
  useUnlockProject: vi.fn(),
}));

vi.mock('../../dashboard/hooks/useChecklistProgress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../dashboard/hooks/useChecklistProgress')>();
  return { ...actual, useChecklistProgress: vi.fn() };
});

vi.mock('../../../data/checklist-links', () => ({ getLinksForStep: () => null }));
vi.mock('../../../api/useGovLink', () => ({ useGovLink: () => ({ link: undefined, isLoading: false }) }));
vi.mock('../../documents/DocumentsVault', () => ({ default: () => null }));
vi.mock('../components/BuddyList', () => ({ default: () => null }));

import { useProject, useUnlockProject } from '../hooks/useProjectMutations';
import { useChecklistProgress } from '../../dashboard/hooks/useChecklistProgress';

const mockedUseProject = vi.mocked(useProject);
const mockedUseUnlock = vi.mocked(useUnlockProject);
const mockedUseProgress = vi.mocked(useChecklistProgress);

const updateStep = vi.fn();
const updateFacts = vi.fn();
const unlockMutate = vi.fn();

function renderPage() {
  return render(
    <MemoryRouter>
      <ChecklistPage />
    </MemoryRouter>,
  );
}

// The "Prochaine action" recommendation box can repeat a step's title elsewhere on the
// page, so step-list assertions are scoped to the "Avant le départ" <h2> section instead
// of querying the whole document.
function stepsContainer() {
  const heading = screen
    .getAllByRole('heading', { level: 2 })
    .find((h) => h.textContent?.includes('Avant le départ'));
  return within(heading!.parentElement!);
}

const tracking = (overrides: any = {}) => ({
  idProcedureTracking: 1,
  status: 'not_started',
  completedFacts: [],
  end_date: null,
  admin_procedure: {
    procedureType: 'Visa',
    category: 'visa',
    phase: 'before',
    daysBeforeDeparture: 30,
    actionItems: [],
    keyFacts: [],
  },
  ...overrides,
});

describe('ChecklistPage', () => {
  beforeEach(() => {
    updateStep.mockReset().mockResolvedValue(undefined);
    updateFacts.mockReset().mockResolvedValue(undefined);
    unlockMutate.mockReset();
    mockedUseProject.mockReturnValue({ data: { idProject: 1, isPaid: true } } as any);
    mockedUseUnlock.mockReturnValue({ mutate: unlockMutate, isPending: false } as any);
    mockedUseProgress.mockReturnValue({
      progress: [],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
  });

  it('shows a spinner while loading', () => {
    mockedUseProgress.mockReturnValue({ progress: [], updateStep, updateFacts, isLoading: true } as any);
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  describe('paywall', () => {
    // PRICING DÉSACTIVÉ : plus aucun gating — un projet non payé voit toutes ses étapes.
    it('shows every step even when the project is unpaid (pricing désactivé)', () => {
      mockedUseProject.mockReturnValue({ data: { idProject: 1, isPaid: false } } as any);
      mockedUseProgress.mockReturnValue({
        progress: Array.from({ length: 5 }, (_, i) =>
          tracking({ idProcedureTracking: i, admin_procedure: { ...tracking().admin_procedure, procedureType: `Step ${i}` } }),
        ),
        updateStep,
        updateFacts,
        isLoading: false,
      } as any);
      renderPage();

      const list = stepsContainer();
      expect(list.getByText('Step 0')).toBeInTheDocument();
      expect(list.getByText('Step 4')).toBeInTheDocument();
      expect(screen.queryByText(/verrouillée/)).not.toBeInTheDocument();
    });

    it('does not gate anything when the project is paid', () => {
      mockedUseProject.mockReturnValue({ data: { idProject: 1, isPaid: true } } as any);
      mockedUseProgress.mockReturnValue({
        progress: Array.from({ length: 5 }, (_, i) =>
          tracking({ idProcedureTracking: i, admin_procedure: { ...tracking().admin_procedure, procedureType: `Step ${i}` } }),
        ),
        updateStep,
        updateFacts,
        isLoading: false,
      } as any);
      renderPage();

      expect(stepsContainer().getByText('Step 4')).toBeInTheDocument();
      expect(screen.queryByText(/verrouillée/)).not.toBeInTheDocument();
    });

    /* ===== PRICING DÉSACTIVÉ — CTA et modale de paiement commentés, tests avec =====
    it('opens the payment modal from the unlock CTA', () => {
      mockedUseProject.mockReturnValue({ data: { idProject: 1, isPaid: false } } as any);
      mockedUseProgress.mockReturnValue({
        progress: Array.from({ length: 4 }, (_, i) => tracking({ idProcedureTracking: i })),
        updateStep,
        updateFacts,
        isLoading: false,
      } as any);
      renderPage();

      fireEvent.click(screen.getByText('Débloquer mon projet — 49 €'));
      expect(screen.getByText('Débloquer ce projet')).toBeInTheDocument();
    });

    it('closes the modal on cancel', () => {
      mockedUseProject.mockReturnValue({ data: { idProject: 1, isPaid: false } } as any);
      mockedUseProgress.mockReturnValue({
        progress: Array.from({ length: 4 }, (_, i) => tracking({ idProcedureTracking: i })),
        updateStep,
        updateFacts,
        isLoading: false,
      } as any);
      renderPage();

      fireEvent.click(screen.getByText('Débloquer mon projet — 49 €'));
      fireEvent.click(screen.getByText('Annuler'));
      expect(screen.queryByText('Débloquer ce projet')).not.toBeInTheDocument();
    });

    it('unlocks the project and closes the modal on success', async () => {
      mockedUseProject.mockReturnValue({ data: { idProject: 1, isPaid: false } } as any);
      mockedUseProgress.mockReturnValue({
        progress: Array.from({ length: 4 }, (_, i) => tracking({ idProcedureTracking: i })),
        updateStep,
        updateFacts,
        isLoading: false,
      } as any);
      unlockMutate.mockImplementation((_id, opts) => opts?.onSuccess?.());
      renderPage();

      fireEvent.click(screen.getByText('Débloquer mon projet — 49 €'));
      fireEvent.click(screen.getByText('Payer 49 € (démo)'));

      expect(unlockMutate).toHaveBeenCalledWith(1, expect.objectContaining({ onSuccess: expect.any(Function) }));
      await waitFor(() => expect(screen.queryByText('Débloquer ce projet')).not.toBeInTheDocument());
    });
    ===== FIN PRICING DÉSACTIVÉ ===== */
  });

  describe('filters', () => {
    const steps = [
      tracking({ idProcedureTracking: 1, status: 'completed', admin_procedure: { ...tracking().admin_procedure, procedureType: 'Done step' } }),
      tracking({ idProcedureTracking: 2, admin_procedure: { ...tracking().admin_procedure, procedureType: 'Todo step', daysBeforeDeparture: 5 } }),
    ];

    it('the "completed" filter shows only completed steps', () => {
      mockedUseProgress.mockReturnValue({ progress: steps, updateStep, updateFacts, isLoading: false } as any);
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Complété' }));
      const list = stepsContainer();
      expect(list.getByText('Done step')).toBeInTheDocument();
      expect(list.queryByText('Todo step')).not.toBeInTheDocument();
    });

    it('the "todo" filter hides completed steps', () => {
      mockedUseProgress.mockReturnValue({ progress: steps, updateStep, updateFacts, isLoading: false } as any);
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'À faire' }));
      const list = stepsContainer();
      expect(list.queryByText('Done step')).not.toBeInTheDocument();
      expect(list.getByText('Todo step')).toBeInTheDocument();
    });

    it('the search box filters by step title', () => {
      mockedUseProgress.mockReturnValue({ progress: steps, updateStep, updateFacts, isLoading: false } as any);
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('Rechercher une étape...'), { target: { value: 'todo' } });
      const list = stepsContainer();
      expect(list.queryByText('Done step')).not.toBeInTheDocument();
      expect(list.getByText('Todo step')).toBeInTheDocument();
    });

    it('shows a no-match message when the filter/search yields nothing', () => {
      mockedUseProgress.mockReturnValue({ progress: steps, updateStep, updateFacts, isLoading: false } as any);
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('Rechercher une étape...'), { target: { value: 'zzz' } });
      expect(screen.getByText('Aucune étape ne correspond à ce filtre.')).toBeInTheDocument();
    });
  });

  it('toggles a step completion status when its circle button is clicked', async () => {
    mockedUseProgress.mockReturnValue({
      progress: [tracking({ idProcedureTracking: 9 })],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();

    const toggleBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.querySelector('svg.lucide-circle'),
    );
    fireEvent.click(toggleBtn!);

    await waitFor(() => expect(updateStep).toHaveBeenCalledWith({ trackingId: 9, status: 'completed' }));
  });

  it('shows a feasibility warning when a before-departure step is already overdue', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    mockedUseProject.mockReturnValue({
      data: { idProject: 1, isPaid: true, expectedDepartureDate: '2026-01-05T00:00:00Z' },
    } as any);
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 1,
          admin_procedure: { ...tracking().admin_procedure, procedureType: 'Overdue', daysBeforeDeparture: 60 },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();
    expect(screen.getByText(/Ce départ n'est peut-être plus tenable/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('recommends the earliest-deadline incomplete step as the next action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    mockedUseProject.mockReturnValue({
      data: { idProject: 1, isPaid: true, expectedDepartureDate: '2026-06-01T00:00:00Z' },
    } as any);
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({ idProcedureTracking: 1, admin_procedure: { ...tracking().admin_procedure, procedureType: 'Far', daysBeforeDeparture: 10 } }),
        tracking({ idProcedureTracking: 2, admin_procedure: { ...tracking().admin_procedure, procedureType: 'Near', daysBeforeDeparture: 150 } }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();
    const nextActionBox = screen.getByText('Prochaine action').closest('div')!.parentElement!;
    expect(nextActionBox).toHaveTextContent('Near');
    vi.useRealTimers();
  });

  it('shows a congratulations message once every step is completed', () => {
    mockedUseProgress.mockReturnValue({
      progress: [tracking({ idProcedureTracking: 1, status: 'completed' })],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();
    expect(screen.getByText(/Toutes tes démarches sont faites/)).toBeInTheDocument();
  });

  it('expands a step with substeps and toggles one, calling updateFacts', async () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 3,
          admin_procedure: {
            ...tracking().admin_procedure,
            procedureType: 'With substeps',
            actionItems: ['Faire A', 'Faire B'],
          },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();

    // Substeps only appear once the row is expanded.
    expect(screen.queryByText('Faire A')).not.toBeInTheDocument();
    fireEvent.click(stepsContainer().getByText('With substeps'));
    expect(screen.getByText('Faire A')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Faire A'));
    await waitFor(() =>
      expect(updateFacts).toHaveBeenCalledWith({ trackingId: 3, completedFacts: [0] }),
    );
  });

  it('renders and completes an on-arrival step in its own section', async () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          idProcedureTracking: 4,
          admin_procedure: {
            ...tracking().admin_procedure,
            procedureType: 'Arrival step',
            phase: 'on_arrival',
          },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();

    const arrivalHeading = screen.getByText(/À l'arrivée/);
    expect(arrivalHeading).toBeInTheDocument();
    expect(within(arrivalHeading.parentElement!.parentElement!).getByText('Arrival step')).toBeInTheDocument();

    const toggleBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.querySelector('svg.lucide-circle'),
    );
    fireEvent.click(toggleBtn!);
    await waitFor(() => expect(updateStep).toHaveBeenCalledWith({ trackingId: 4, status: 'completed' }));
  });

  it('completes the recommended next action from its "Fait" button', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    mockedUseProject.mockReturnValue({
      data: { idProject: 1, isPaid: true, expectedDepartureDate: '2026-06-01T00:00:00Z' },
    } as any);
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({ idProcedureTracking: 5, admin_procedure: { ...tracking().admin_procedure, procedureType: 'Next up' } }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();

    const nextActionBox = screen.getByText('Prochaine action').closest('div')!.parentElement!;
    vi.useRealTimers();
    fireEvent.click(within(nextActionBox).getByText('Fait'));
    await waitFor(() => expect(updateStep).toHaveBeenCalledWith({ trackingId: 5, status: 'completed' }));
  });

  it('switches between list and timeline views', () => {
    mockedUseProgress.mockReturnValue({
      progress: [tracking({ idProcedureTracking: 1 })],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();

    fireEvent.click(screen.getByTitle('Vue timeline'));
    fireEvent.click(screen.getByTitle('Vue liste'));
    // No crash and the step is still visible after switching views back and forth.
    expect(stepsContainer().getByText('Visa')).toBeInTheDocument();
  });

  // Régression : le re-tri par priorités écrasait l'ordre chronologique de la
  // timeline — les deux vues devenaient identiques et le toggle semblait mort.
  it('list view floats priority categories up, timeline view keeps chronological order', () => {
    mockedUseProject.mockReturnValue({
      data: { idProject: 1, isPaid: true, priorities: 'housing' },
    } as any);
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({ idProcedureTracking: 1 }), // Visa (catégorie hors priorités)
        tracking({
          idProcedureTracking: 2,
          admin_procedure: {
            procedureType: 'Logement step',
            category: 'logement',
            phase: 'before',
            daysBeforeDeparture: 10,
            actionItems: [],
            keyFacts: [],
          },
        }),
      ],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();

    // Vue liste : la catégorie prioritaire (logement) remonte devant Visa.
    let text = screen
      .getAllByRole('heading', { level: 2 })
      .find((h) => h.textContent?.includes('Avant le départ'))!.parentElement!.textContent!;
    expect(text.indexOf('Logement step')).toBeLessThan(text.indexOf('Visa'));

    // Vue timeline : ordre d'origine/chronologique préservé — Visa repasse devant.
    fireEvent.click(screen.getByTitle('Vue timeline'));
    text = screen
      .getAllByRole('heading', { level: 2 })
      .find((h) => h.textContent?.includes('Avant le départ'))!.parentElement!.textContent!;
    expect(text.indexOf('Visa')).toBeLessThan(text.indexOf('Logement step'));
  });

  /* ===== PRICING DÉSACTIVÉ — modale commentée, test avec =====
  it('closes the payment modal when clicking the backdrop', () => {
    mockedUseProject.mockReturnValue({ data: { idProject: 1, isPaid: false } } as any);
    mockedUseProgress.mockReturnValue({
      progress: Array.from({ length: 4 }, (_, i) => tracking({ idProcedureTracking: i })),
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();

    fireEvent.click(screen.getByText('Débloquer mon projet — 49 €'));
    const backdrop = screen.getByText('Débloquer ce projet').closest('.fixed.inset-0')!;
    fireEvent.click(backdrop);
    expect(screen.queryByText('Débloquer ce projet')).not.toBeInTheDocument();
  });
  ===== FIN PRICING DÉSACTIVÉ ===== */

  /* ===== DOCUMENTS DÉSACTIVÉS — panneau par étape commenté, test avec =====
  it('toggles the attached-documents panel for a step', () => {
    mockedUseProgress.mockReturnValue({
      progress: [tracking({ idProcedureTracking: 1 })],
      updateStep,
      updateFacts,
      isLoading: false,
    } as any);
    renderPage();

    const docsButton = stepsContainer().getByText('Documents');
    expect(document.querySelector('.bg-gray-50\\/50.px-4.py-3')).not.toBeInTheDocument();
    fireEvent.click(docsButton);
    expect(document.querySelector('.bg-gray-50\\/50.px-4.py-3')).toBeInTheDocument();
    fireEvent.click(docsButton);
    expect(document.querySelector('.bg-gray-50\\/50.px-4.py-3')).not.toBeInTheDocument();
  });
  ===== FIN DOCUMENTS DÉSACTIVÉS ===== */

  it('shows the J-X countdown for a project with a departure date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    mockedUseProject.mockReturnValue({
      data: { idProject: 1, isPaid: true, expectedDepartureDate: '2026-01-31T00:00:00Z' },
    } as any);
    renderPage();
    expect(screen.getByText('J-30')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('invites the user to complete the missing profile fields for full personalization', () => {
    mockedUseProject.mockReturnValue({
      data: { idProject: 1, isPaid: true, mainObjective: 'study' },
    } as any);
    renderPage();

    expect(screen.getByText(/Checklist partiellement personnalisée/)).toBeInTheDocument();
    // objectif renseigné → seuls nationalité et situation familiale sont réclamés
    expect(
      screen.getByText(/ta nationalité et ta situation familiale/),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Compléter mon profil/ })).toHaveAttribute(
      'href',
      '/onboarding/1',
    );
  });

  it('hides the profile-completion banner when the profile is fully filled', () => {
    mockedUseProject.mockReturnValue({
      data: {
        idProject: 1,
        isPaid: true,
        mainObjective: 'study',
        nationality: 'SN',
        hasChildren: false,
      },
    } as any);
    renderPage();

    expect(screen.queryByText(/Checklist partiellement personnalisée/)).not.toBeInTheDocument();
  });
});
