import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resolveCountry } from '../data/countryMappings';
import type { SupportedCountry } from '../data/supportedCountries';

const STORAGE_KEY = 'skywalk_destination';

interface DestinationContextType {
  countrySlug: string | null;
  citySlug: string | null;
  setCountrySlug: (slug: string | null) => void;
  setCitySlug: (slug: string | null) => void;
  /** Fully-resolved SupportedCountry record — gives code, name, apiCity, etc. */
  country: SupportedCountry | undefined;
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

function resolveToSlug(input: string | null | undefined): string | null {
  if (!input) return null;
  return resolveCountry(input)?.slug ?? null;
}

export function DestinationProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Seed order: (1) URL ?country= param (accepts slug or ISO2), (2) localStorage, (3) null
  const [countrySlug, setCountrySlugState] = useState<string | null>(() => {
    const urlParam = searchParams.get('country');
    if (urlParam) {
      const resolved = resolveToSlug(urlParam);
      if (resolved) return resolved;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const resolved = resolveToSlug(stored);
      if (resolved) return resolved;
    }
    return null;
  });

  const [citySlug, setCitySlug] = useState<string | null>(null);

  // ── Keep URL ?country= in sync whenever countrySlug changes
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (countrySlug) {
          next.set('country', countrySlug);
        } else {
          next.delete('country');
        }
        return next;
      },
      { replace: true },
    );
  }, [countrySlug]); // eslint-disable-line react-hooks/exhaustive-deps
  // (setSearchParams is stable; omitting it avoids an infinite loop with strict equality checks)

  // ── Persist countrySlug to localStorage
  useEffect(() => {
    if (countrySlug) {
      localStorage.setItem(STORAGE_KEY, countrySlug);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [countrySlug]);

  const setCountrySlug = (slug: string | null) => {
    setCountrySlugState(slug);
    // Reset city when country changes
    setCitySlug(null);
  };

  const country = resolveCountry(countrySlug);

  return (
    <DestinationContext.Provider
      value={{ countrySlug, citySlug, setCountrySlug, setCitySlug, country }}
    >
      {children}
    </DestinationContext.Provider>
  );
}

export function useDestination(): DestinationContextType {
  const ctx = useContext(DestinationContext);
  if (!ctx) {
    throw new Error('useDestination must be used inside <DestinationProvider>');
  }
  return ctx;
}
