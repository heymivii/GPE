import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Stable references — an inline object/function here gets a new identity every render,
// which would recreate loadUserData (deps=[t]) and loop the mount effect forever.
const stableT = (k: string) => k;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: stableT }),
}));

import useUserData from './useUserData';

describe('useUserData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to an incomplete-onboarding user when nothing is stored', async () => {
    const { result } = renderHook(() => useUserData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.userData).toEqual({
      id: '1',
      name: 'SkyWalk User',
      email: 'user@skywalk.com',
      onboardingCompleted: false,
    });
  });

  it('loads the onboarding data when completed and stored (after the simulated delay)', async () => {
    const onboardingData = { destination: { toCountry: 'FR' } };
    localStorage.setItem('skywalk-user-data', JSON.stringify(onboardingData));
    localStorage.setItem('skywalk-onboarding-completed', 'true');

    const { result } = renderHook(() => useUserData());
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 2000 });

    expect(result.current.userData?.onboardingCompleted).toBe(true);
    expect(result.current.userData?.onboardingData).toEqual(onboardingData);
  });

  it('loads saved dashboard preferences from localStorage', async () => {
    const saved = { dashboardLayout: ['a'], favoriteWidgets: ['b'], hiddenWidgets: ['c'] };
    localStorage.setItem('dashboard-preferences', JSON.stringify(saved));

    const { result } = renderHook(() => useUserData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.preferences).toEqual(saved);
  });

  it('surfaces a parse error instead of crashing when stored data is corrupted', async () => {
    localStorage.setItem('skywalk-user-data', 'not-json');
    localStorage.setItem('skywalk-onboarding-completed', 'true');

    const { result } = renderHook(() => useUserData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });

  it('updatePreferences merges and persists the new preferences', async () => {
    const { result } = renderHook(() => useUserData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.updatePreferences({ favoriteWidgets: ['weather'] }));

    expect(result.current.preferences.favoriteWidgets).toEqual(['weather']);
    const stored = JSON.parse(localStorage.getItem('dashboard-preferences')!);
    expect(stored.favoriteWidgets).toEqual(['weather']);
  });

  it('toggleWidgetVisibility adds then removes a widget id', async () => {
    const { result } = renderHook(() => useUserData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.toggleWidgetVisibility('weather'));
    expect(result.current.preferences.hiddenWidgets).toEqual(['weather']);

    act(() => result.current.toggleWidgetVisibility('weather'));
    expect(result.current.preferences.hiddenWidgets).toEqual([]);
  });

  it('reorderWidgets updates the dashboard layout', async () => {
    const { result } = renderHook(() => useUserData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.reorderWidgets(['budget-tracker', 'checklist']));
    expect(result.current.preferences.dashboardLayout).toEqual(['budget-tracker', 'checklist']);
  });

  it('refetch re-runs the load and resets the loading state', async () => {
    const { result } = renderHook(() => useUserData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.userData).toBeTruthy();
  });
});
