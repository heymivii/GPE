import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'skywalk-active-project';

interface ActiveProjectContextValue {
  /** The expatriation project the whole site is currently contextualised to (null = none chosen). */
  activeProjectId: number | null;
  setActiveProjectId: (id: number | null) => void;
}

const ActiveProjectContext = createContext<ActiveProjectContextValue | undefined>(undefined);

/**
 * Site-wide "current expatriation project". Persisted in localStorage so navigation, the NavBar
 * switcher and the dashboard all agree on which project the user is working on.
 */
export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [activeProjectId, setId] = useState<number | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  });

  const setActiveProjectId = useCallback((id: number | null) => {
    setId(id);
    if (id == null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  return (
    <ActiveProjectContext.Provider value={{ activeProjectId, setActiveProjectId }}>
      {children}
    </ActiveProjectContext.Provider>
  );
}

export function useActiveProject(): ActiveProjectContextValue {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) {
    // Tolerant fallback so components used outside the provider (tests) don't crash.
    return { activeProjectId: null, setActiveProjectId: () => {} };
  }
  return ctx;
}
