import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CountdownWidget from './CountdownWidget';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: any) => opts?.defaultValue ?? _key,
    i18n: { language: 'fr' },
  }),
}));

vi.mock('../hooks/useChecklistProgress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useChecklistProgress')>();
  return { ...actual, useChecklistProgress: vi.fn() };
});

import { useChecklistProgress } from '../hooks/useChecklistProgress';
const mockedUseProgress = vi.mocked(useChecklistProgress);

function renderWidget(props: Partial<React.ComponentProps<typeof CountdownWidget>> = {}) {
  return render(
    <MemoryRouter>
      <CountdownWidget projectId={1} {...props} />
    </MemoryRouter>,
  );
}

const tracking = (overrides: any = {}) => ({
  status: 'not_started',
  admin_procedure: {
    procedureType: 'Visa',
    category: 'visa',
    phase: 'before',
    daysBeforeDeparture: 30,
  },
  ...overrides,
});

describe('CountdownWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    mockedUseProgress.mockReturnValue({ progress: [] } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prompts to add a departure date when none is set', () => {
    renderWidget({ departureDate: null });
    expect(
      screen.getByText('Ajoutez une date de départ pour activer le compte à rebours.'),
    ).toBeInTheDocument();
  });

  it('shows the J-X countdown for a future departure date', () => {
    renderWidget({ departureDate: '2026-01-31T00:00:00Z' });
    expect(screen.getByText('J-{{days}}')).toBeInTheDocument();
  });

  it('shows a departed message once the departure date has passed', () => {
    renderWidget({ departureDate: '2025-12-01T00:00:00Z' });
    expect(screen.getByText('🎉 Vous êtes parti·e !')).toBeInTheDocument();
  });

  it('lists upcoming deadlines for steps still due before departure, nearest first', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          admin_procedure: {
            procedureType: 'Far step',
            category: 'visa',
            phase: 'before',
            daysBeforeDeparture: 5,
          },
        }),
        tracking({
          admin_procedure: {
            procedureType: 'Near step',
            category: 'visa',
            phase: 'before',
            daysBeforeDeparture: 25,
          },
        }),
      ],
    } as any);
    renderWidget({ departureDate: '2026-01-31T00:00:00Z' });

    const titles = screen.getAllByText(/step/).map((el) => el.textContent);
    expect(titles).toEqual(['Near step', 'Far step']); // higher daysBeforeDeparture -> sooner deadline -> first
  });

  it('excludes on-arrival steps from the upcoming deadlines list', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          admin_procedure: {
            procedureType: 'Arrival step',
            category: 'visa',
            phase: 'on_arrival',
            daysBeforeDeparture: 5,
          },
        }),
      ],
    } as any);
    renderWidget({ departureDate: '2026-01-31T00:00:00Z' });
    expect(screen.queryByText('Arrival step')).not.toBeInTheDocument();
  });

  it('excludes already-completed steps from the upcoming deadlines list', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          status: 'completed',
          admin_procedure: {
            procedureType: 'Done step',
            category: 'visa',
            phase: 'before',
            daysBeforeDeparture: 5,
          },
        }),
      ],
    } as any);
    renderWidget({ departureDate: '2026-01-31T00:00:00Z' });
    expect(screen.queryByText('Done step')).not.toBeInTheDocument();
  });

  it('shows a completion message once nothing is left before departure', () => {
    mockedUseProgress.mockReturnValue({ progress: [] } as any);
    renderWidget({ departureDate: '2026-01-31T00:00:00Z' });
    expect(screen.getByText(/Toutes vos démarches sont à jour/)).toBeInTheDocument();
  });

  it('distinguishes "prep done" from "all done" when only on-arrival steps remain', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          admin_procedure: {
            procedureType: 'Arrival step',
            category: 'visa',
            phase: 'on_arrival',
            daysBeforeDeparture: 5,
          },
        }),
      ],
    } as any);
    renderWidget({ departureDate: '2026-01-31T00:00:00Z' });
    expect(
      screen.getByText(/Préparation terminée — les démarches sur place vous attendent à l’arrivée/),
    ).toBeInTheDocument();
  });

  it('filters out steps not applicable to the project travelType/objective', () => {
    mockedUseProgress.mockReturnValue({
      progress: [
        tracking({
          admin_procedure: {
            procedureType: 'Family-only step',
            category: 'visa',
            phase: 'before',
            daysBeforeDeparture: 5,
            onlyFor: { travelType: ['family'] },
          },
        }),
      ],
    } as any);
    renderWidget({
      departureDate: '2026-01-31T00:00:00Z',
      project: { travelType: 'alone' },
    });
    expect(screen.queryByText('Family-only step')).not.toBeInTheDocument();
  });

  it('links to the project checklist page', () => {
    renderWidget({ departureDate: '2026-01-31T00:00:00Z' });
    expect(screen.getByRole('link', { name: /Voir ma checklist/ })).toHaveAttribute(
      'href',
      '/projects/1/checklist',
    );
  });
});
