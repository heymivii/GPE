import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardPreferences } from './useDashboardPreferences';

const STORAGE_KEY = 'skywalk-dashboard-preferences';

describe('useDashboardPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to no hidden widgets when nothing is stored', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.hiddenWidgets).toEqual([]);
  });

  it('restores previously stored preferences (current version)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ hiddenWidgets: ['weather'], version: 2 }),
    );
    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.hiddenWidgets).toEqual(['weather']);
  });

  it('migrates a stale preferences version, keeping hiddenWidgets but dropping layout/sizes', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ hiddenWidgets: ['weather'], layout: ['a', 'b'], version: 1 }),
    );
    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.hiddenWidgets).toEqual(['weather']);
    expect(result.current.widgetOrder).toBeUndefined();
  });

  it('resets to defaults when the stored JSON is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.hiddenWidgets).toEqual([]);
  });

  it('persists preference changes to localStorage', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    act(() => result.current.hideWidget('weather'));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.hiddenWidgets).toEqual(['weather']);
  });

  it('hideWidget/showWidget/isWidgetHidden work together', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    act(() => result.current.hideWidget('weather'));
    expect(result.current.isWidgetHidden('weather')).toBe(true);
    act(() => result.current.showWidget('weather'));
    expect(result.current.isWidgetHidden('weather')).toBe(false);
  });

  it('toggleWidget flips the hidden state', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    act(() => result.current.toggleWidget('weather'));
    expect(result.current.isWidgetHidden('weather')).toBe(true);
    act(() => result.current.toggleWidget('weather'));
    expect(result.current.isWidgetHidden('weather')).toBe(false);
  });

  it('resetPreferences clears the hidden widgets state', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    act(() => result.current.hideWidget('weather'));
    act(() => result.current.resetPreferences());
    expect(result.current.hiddenWidgets).toEqual([]);
    // Note: the persistence effect re-runs right after (preferences changed) and
    // re-writes the now-empty preferences, so the key ends up as '{"hiddenWidgets":[]}'
    // rather than actually absent — this mirrors the hook's real (quirky) behavior.
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ hiddenWidgets: [] }));
  });

  it('updateWidgetOrder sets the layout', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    act(() => result.current.updateWidgetOrder(['b', 'a']));
    expect(result.current.widgetOrder).toEqual(['b', 'a']);
  });

  it('getWidgetSize falls back to the built-in default, then to medium', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    expect(result.current.getWidgetSize('checklist')).toBe('large');
    expect(result.current.getWidgetSize('some-unknown-widget')).toBe('medium');
  });

  // La taille 'small' a été retirée : seules 'medium' et 'large' existent, et
  // un ancien 'small' stocké retombe sur la taille par défaut du widget.
  it('setWidgetSize overrides the default for a specific widget', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    act(() => result.current.setWidgetSize('checklist', 'medium'));
    expect(result.current.getWidgetSize('checklist')).toBe('medium');
  });

  it('cycleWidgetSize toggles medium <-> large', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    act(() => result.current.setWidgetSize('weather', 'medium'));
    act(() => result.current.cycleWidgetSize('weather'));
    expect(result.current.getWidgetSize('weather')).toBe('large');
    act(() => result.current.cycleWidgetSize('weather'));
    expect(result.current.getWidgetSize('weather')).toBe('medium');
  });

  it('falls back to the widget default for a legacy stored "small"', () => {
    const { result } = renderHook(() => useDashboardPreferences());
    act(() => result.current.setWidgetSize('checklist', 'small' as any));
    expect(result.current.getWidgetSize('checklist')).toBe('large');
  });
});
