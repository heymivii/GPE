import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  getStepDeadline,
  filterStepsForProject,
  useChecklistProgress,
} from './useChecklistProgress';

describe('getStepDeadline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all-null/false when daysBeforeDeparture or departureDate is missing', () => {
    expect(getStepDeadline(undefined, '2026-02-01')).toEqual({
      date: null,
      isUrgent: false,
      isLate: false,
      daysLeft: null,
    });
    expect(getStepDeadline(10, undefined)).toEqual({
      date: null,
      isUrgent: false,
      isLate: false,
      daysLeft: null,
    });
  });

  it('computes the deadline as departure date minus daysBeforeDeparture', () => {
    const result = getStepDeadline(30, '2026-02-01T00:00:00Z');
    expect(result.date?.toISOString()).toBe(new Date('2026-01-02T00:00:00Z').toISOString());
  });

  it('marks the deadline urgent when between 1 and 14 days remain', () => {
    // departure in 40 days, daysBeforeDeparture=30 -> deadline in 10 days.
    const departure = new Date('2026-01-01T00:00:00Z');
    departure.setDate(departure.getDate() + 40);
    const result = getStepDeadline(30, departure);
    expect(result.daysLeft).toBe(10);
    expect(result.isUrgent).toBe(true);
    expect(result.isLate).toBe(false);
  });

  it('marks the deadline late once it has passed', () => {
    const departure = new Date('2026-01-01T00:00:00Z');
    departure.setDate(departure.getDate() + 5);
    const result = getStepDeadline(30, departure); // deadline 25 days in the past
    expect(result.isLate).toBe(true);
    expect(result.isUrgent).toBe(false);
  });

  it('is neither urgent nor late when more than 14 days remain', () => {
    const departure = new Date('2026-01-01T00:00:00Z');
    departure.setDate(departure.getDate() + 60);
    const result = getStepDeadline(30, departure); // deadline in 30 days
    expect(result.isUrgent).toBe(false);
    expect(result.isLate).toBe(false);
  });
});

describe('filterStepsForProject', () => {
  it('keeps steps with no onlyFor filter', () => {
    const steps = [{ id: 1, onlyFor: undefined }];
    expect(filterStepsForProject(steps, {})).toEqual(steps);
  });

  it('filters by travelType', () => {
    const steps = [
      { id: 1, onlyFor: { travelType: ['couple'] } },
      { id: 2, onlyFor: { travelType: ['alone'] } },
    ];
    const result = filterStepsForProject(steps, { travelType: 'alone' });
    expect(result.map((s) => s.id)).toEqual([2]);
  });

  it('filters by objective', () => {
    const steps = [
      { id: 1, onlyFor: { objective: ['work'] } },
      { id: 2, onlyFor: { objective: ['study'] } },
    ];
    const result = filterStepsForProject(steps, { objective: 'study' });
    expect(result.map((s) => s.id)).toEqual([2]);
  });

  it('requires both travelType and objective to match when both filters are set', () => {
    const steps = [
      { id: 1, onlyFor: { travelType: ['alone'], objective: ['work'] } },
    ];
    expect(
      filterStepsForProject(steps, { travelType: 'alone', objective: 'study' }),
    ).toEqual([]);
    expect(
      filterStepsForProject(steps, { travelType: 'alone', objective: 'work' }),
    ).toEqual(steps);
  });
});

vi.mock('../../../api/checklist', () => ({
  checklistApi: {
    getProgress: vi.fn(),
    updateProgress: vi.fn(),
    updateCompletedFacts: vi.fn(),
  },
}));

import { checklistApi } from '../../../api/checklist';
const mockedApi = vi.mocked(checklistApi);

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useChecklistProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the checklist progress for the project', async () => {
    mockedApi.getProgress.mockResolvedValue([{ idProcedureTracking: 1 }] as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useChecklistProgress(5), { wrapper: wrapper(qc) });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockedApi.getProgress).toHaveBeenCalledWith(5);
    expect(result.current.progress).toEqual([{ idProcedureTracking: 1 }]);
  });

  it('updateStep updates progress and invalidates both checklist and project caches', async () => {
    mockedApi.getProgress.mockResolvedValue([]);
    mockedApi.updateProgress.mockResolvedValue({ idProcedureTracking: 1, status: 'completed' } as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useChecklistProgress(5), { wrapper: wrapper(qc) });
    await result.current.updateStep({ trackingId: 1, status: 'completed' });

    expect(mockedApi.updateProgress).toHaveBeenCalledWith(1, 'completed');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['checklist-progress', 5] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['projects'] });
  });

  it('updateFacts updates completedFacts and only invalidates the checklist cache', async () => {
    mockedApi.getProgress.mockResolvedValue([]);
    mockedApi.updateCompletedFacts.mockResolvedValue({ idProcedureTracking: 1 } as any);
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useChecklistProgress(5), { wrapper: wrapper(qc) });
    await result.current.updateFacts({ trackingId: 1, completedFacts: [1, 2] });

    expect(mockedApi.updateCompletedFacts).toHaveBeenCalledWith(1, [1, 2]);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['checklist-progress', 5] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['projects'] });
  });
});
