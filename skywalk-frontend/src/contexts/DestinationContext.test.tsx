import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';

const COUNTRIES: Record<string, { slug: string; code: string; name: string }> = {
  fr: { slug: 'france', code: 'FR', name: 'France' },
  france: { slug: 'france', code: 'FR', name: 'France' },
  es: { slug: 'espagne', code: 'ES', name: 'Espagne' },
};

vi.mock('../data/countryMappings', () => ({
  resolveCountry: (input: string | null | undefined) =>
    input ? COUNTRIES[input.toLowerCase()] : undefined,
}));

import { DestinationProvider, useDestination } from './DestinationContext';

function useHarness() {
  const dest = useDestination();
  const [params] = useSearchParams();
  return { dest, country: params.get('country') };
}

function wrapperWithEntry(entry: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[entry]}>
      <DestinationProvider>{children}</DestinationProvider>
    </MemoryRouter>
  );
}

describe('DestinationContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds the country from the ?country= URL param (accepts a slug or ISO2)', () => {
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperWithEntry('/?country=fr') });
    expect(result.current.dest.countrySlug).toBe('france');
  });

  it('falls back to localStorage when there is no URL param', () => {
    localStorage.setItem('skywalk_destination', 'es');
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperWithEntry('/') });
    expect(result.current.dest.countrySlug).toBe('espagne');
  });

  it('defaults to null when neither the URL nor localStorage has a value', () => {
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperWithEntry('/') });
    expect(result.current.dest.countrySlug).toBeNull();
    expect(result.current.dest.country).toBeUndefined();
  });

  it('ignores an unresolvable URL param and falls back to localStorage', () => {
    localStorage.setItem('skywalk_destination', 'fr');
    const { result } = renderHook(() => useHarness(), {
      wrapper: wrapperWithEntry('/?country=atlantide'),
    });
    expect(result.current.dest.countrySlug).toBe('france');
  });

  it('setCountrySlug updates the slug, resolves the country, and resets the city', () => {
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperWithEntry('/') });
    act(() => result.current.dest.setCitySlug('paris'));
    act(() => result.current.dest.setCountrySlug('france'));
    expect(result.current.dest.countrySlug).toBe('france');
    expect(result.current.dest.country?.code).toBe('FR');
    expect(result.current.dest.citySlug).toBeNull();
  });

  it('persists the country slug to localStorage and clears it when set to null', () => {
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperWithEntry('/') });
    act(() => result.current.dest.setCountrySlug('france'));
    expect(localStorage.getItem('skywalk_destination')).toBe('france');
    act(() => result.current.dest.setCountrySlug(null));
    expect(localStorage.getItem('skywalk_destination')).toBeNull();
  });

  it('keeps the ?country= URL param in sync with the current slug', () => {
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperWithEntry('/') });
    act(() => result.current.dest.setCountrySlug('france'));
    expect(result.current.country).toBe('france');
    act(() => result.current.dest.setCountrySlug(null));
    expect(result.current.country).toBeNull();
  });

  it('throws when useDestination is used outside of the provider', () => {
    const { result } = renderHook(() => {
      try {
        return useDestination();
      } catch (e) {
        return e;
      }
    });
    expect(result.current).toBeInstanceOf(Error);
  });
});
