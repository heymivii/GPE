import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ActiveProjectProvider, useActiveProject } from './ActiveProjectContext';

function wrapper({ children }: { children: ReactNode }) {
  return <ActiveProjectProvider>{children}</ActiveProjectProvider>;
}

describe('ActiveProjectContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to null when nothing is stored', () => {
    const { result } = renderHook(() => useActiveProject(), { wrapper });
    expect(result.current.activeProjectId).toBeNull();
  });

  it('restores a previously stored project id', () => {
    localStorage.setItem('skywalk-active-project', '42');
    const { result } = renderHook(() => useActiveProject(), { wrapper });
    expect(result.current.activeProjectId).toBe(42);
  });

  it('persists a new project id to localStorage', () => {
    const { result } = renderHook(() => useActiveProject(), { wrapper });
    act(() => result.current.setActiveProjectId(7));
    expect(result.current.activeProjectId).toBe(7);
    expect(localStorage.getItem('skywalk-active-project')).toBe('7');
  });

  it('clears the stored project id when set to null', () => {
    localStorage.setItem('skywalk-active-project', '7');
    const { result } = renderHook(() => useActiveProject(), { wrapper });
    act(() => result.current.setActiveProjectId(null));
    expect(result.current.activeProjectId).toBeNull();
    expect(localStorage.getItem('skywalk-active-project')).toBeNull();
  });

  it('falls back to a no-op default outside of the provider instead of throwing', () => {
    const { result } = renderHook(() => useActiveProject());
    expect(result.current.activeProjectId).toBeNull();
    expect(() => result.current.setActiveProjectId(5)).not.toThrow();
  });
});
