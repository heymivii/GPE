import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import useOnboarding from './useOnboarding';

const STORAGE_KEY = 'skywalk-onboarding-draft';

const destination = {
  fromCountry: 'FR',
  toCountry: 'DE',
  targetCity: 'Berlin',
  departureYear: '2027',
};

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to step 1 with empty data', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.data).toEqual({});
  });

  it('loads a previously saved draft from localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data: { destination }, currentStep: 3 }),
    );
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.currentStep).toBe(3);
    expect(result.current.data.destination).toEqual(destination);
  });

  it('ignores localStorage when skipLocalStorage is true', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: { destination }, currentStep: 3 }));
    const { result } = renderHook(() => useOnboarding(true));
    expect(result.current.currentStep).toBe(1);
    expect(result.current.data).toEqual({});
  });

  it('does not crash on a corrupted draft, keeping the defaults', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.data).toEqual({});
  });

  it('does not persist to localStorage while data is still empty', () => {
    renderHook(() => useOnboarding());
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('persists data + currentStep once data is set', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.updateStepData('destination', destination));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.data.destination).toEqual(destination);
    expect(stored.currentStep).toBe(1);
  });

  it('does not persist when skipLocalStorage is true', () => {
    const { result } = renderHook(() => useOnboarding(true));
    act(() => result.current.updateStepData('destination', destination));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('updateStepData merges a single step without touching the others', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.updateStepData('destination', destination));
    act(() =>
      result.current.updateStepData('objective', { goal: 'work', stayDuration: '2y' }),
    );
    expect(result.current.data.destination).toEqual(destination);
    expect(result.current.data.objective).toEqual({ goal: 'work', stayDuration: '2y' });
  });

  it('setAllData merges multiple steps at once', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() =>
      result.current.setAllData({
        destination,
        objective: { goal: 'work', stayDuration: '2y' },
      }),
    );
    expect(result.current.data.destination).toEqual(destination);
    expect(result.current.data.objective?.goal).toBe('work');
  });

  it('nextStep/prevStep move within 1..6 bounds', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(1); // clamped at the floor

    for (let i = 0; i < 10; i++) act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(6); // clamped at the ceiling
  });

  it('prevStep decrements when above the floor', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.goToStep(3));
    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(2);
  });

  it('goToStep only accepts values within 1..6', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.goToStep(4));
    expect(result.current.currentStep).toBe(4);
    act(() => result.current.goToStep(0));
    expect(result.current.currentStep).toBe(4); // rejected, unchanged
    act(() => result.current.goToStep(7));
    expect(result.current.currentStep).toBe(4); // rejected, unchanged
  });

  it('getSteps reports done/current/todo relative to the current step', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.goToStep(3));
    const states = result.current.getSteps().map((s) => s.state);
    expect(states).toEqual(['done', 'done', 'current', 'todo', 'todo', 'todo']);
  });

  describe('isStepCompleted', () => {
    it('returns false when the step has no data yet', () => {
      const { result } = renderHook(() => useOnboarding());
      expect(result.current.isStepCompleted('destination')).toBe(false);
    });

    it('validates the destination step requires fromCountry/toCountry/departureYear', () => {
      const { result } = renderHook(() => useOnboarding());
      act(() => result.current.updateStepData('destination', { ...destination, toCountry: '' }));
      expect(result.current.isStepCompleted('destination')).toBe(false);
      act(() => result.current.updateStepData('destination', destination));
      expect(result.current.isStepCompleted('destination')).toBe(true);
    });

    it('validates the needs step requires at least one priority', () => {
      const { result } = renderHook(() => useOnboarding());
      act(() => result.current.updateStepData('needs', { priorities: [] }));
      expect(result.current.isStepCompleted('needs')).toBe(false);
      act(() => result.current.updateStepData('needs', { priorities: ['housing'] }));
      expect(result.current.isStepCompleted('needs')).toBe(true);
    });

    it('validates the objective step requires goal and stayDuration', () => {
      const { result } = renderHook(() => useOnboarding());
      act(() => result.current.updateStepData('objective', { goal: 'work' } as any));
      expect(result.current.isStepCompleted('objective')).toBe(false);
      act(() =>
        result.current.updateStepData('objective', { goal: 'work', stayDuration: '1y' } as any),
      );
      expect(result.current.isStepCompleted('objective')).toBe(true);
    });

    it('validates the preparation step requires a housingBudget', () => {
      const { result } = renderHook(() => useOnboarding());
      act(() => result.current.updateStepData('preparation', {} as any));
      expect(result.current.isStepCompleted('preparation')).toBe(false);
      act(() =>
        result.current.updateStepData('preparation', { housingBudget: '1000' } as any),
      );
      expect(result.current.isStepCompleted('preparation')).toBe(true);
    });
  });

  describe('canGoToStep', () => {
    it('always allows going back to the current step or earlier', () => {
      const { result } = renderHook(() => useOnboarding());
      act(() => result.current.goToStep(3));
      expect(result.current.canGoToStep(1)).toBe(true);
      expect(result.current.canGoToStep(3)).toBe(true);
    });

    it('blocks jumping ahead when an intermediate step is incomplete', () => {
      const { result } = renderHook(() => useOnboarding());
      act(() => result.current.updateStepData('destination', destination));
      // profile (step 2) is not completed yet, so step 3 must be blocked.
      expect(result.current.canGoToStep(3)).toBe(false);
    });

    it('allows jumping ahead once every intermediate step is completed', () => {
      const { result } = renderHook(() => useOnboarding());
      act(() => {
        result.current.setAllData({
          destination,
          profile: { age: '30', status: 'employed', travelParty: 'alone', languageLevel: 'b2' },
        });
      });
      expect(result.current.canGoToStep(3)).toBe(true);
    });
  });

  it('clearDraft resets state and removes the persisted draft', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.updateStepData('destination', destination));
    act(() => result.current.goToStep(3));
    act(() => result.current.clearDraft());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.data).toEqual({});
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
