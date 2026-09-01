import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const authState = { isAuthenticated: false };
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated }),
}));

const stableT = (k: string) => k;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: stableT }),
}));

const destState = { countrySlug: null as string | null, citySlug: null as string | null };
const setSelectedCountry = vi.fn();
const setSelectedCity = vi.fn();
vi.mock('../../../contexts/DestinationContext', () => ({
  useDestination: () => ({
    countrySlug: destState.countrySlug,
    setCountrySlug: setSelectedCountry,
    citySlug: destState.citySlug,
    setCitySlug: setSelectedCity,
  }),
}));

const activeProjectState = { activeProjectId: null as number | null };
vi.mock('../../../contexts/ActiveProjectContext', () => ({
  useActiveProject: () => ({ activeProjectId: activeProjectState.activeProjectId }),
}));

const citiesByCodeState: Record<string, any[]> = {};
vi.mock('../../../hooks/useSupportedCountries', () => ({
  useSupportedCountries: () => ({ citiesByCode: citiesByCodeState }),
}));

vi.mock('../../../data/countryMappings', () => ({
  resolveCountry: (input: string | null | undefined) => {
    const map: Record<string, { slug: string; code: string }> = {
      fr: { slug: 'france', code: 'FR' },
      france: { slug: 'france', code: 'FR' },
    };
    return input ? map[input.toLowerCase()] : undefined;
  },
  slugify: (name: string) => name.toLowerCase().replace(/\s+/g, '-'),
}));

vi.mock('../../../api/expatriation-project', () => ({
  expatriationProjectApi: { getAll: vi.fn() },
}));

vi.mock('../../../data/services-content-by-country', () => ({
  getCountryContent: vi.fn(),
}));

import { expatriationProjectApi } from '../../../api/expatriation-project';
import { getCountryContent } from '../../../data/services-content-by-country';
import { useServiceContent } from './useServiceContent';

const mockedGetAll = vi.mocked(expatriationProjectApi.getAll);
const mockedGetCountryContent = vi.mocked(getCountryContent);

const service = {
  id: 'emploi',
  title: 'Emploi',
  guides: [{ title: 'base guide', steps: ['step1'] }],
  tips: ['base tip'],
  stats: [{ label: 'base stat', value: '1' }],
} as any;

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

function newQc() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('useServiceContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    destState.countrySlug = null;
    destState.citySlug = null;
    activeProjectState.activeProjectId = null;
    Object.keys(citiesByCodeState).forEach((k) => delete citiesByCodeState[k]);
    mockedGetCountryContent.mockReturnValue(undefined as any);
  });

  it('displayMode is "generic" for an unauthenticated visitor', () => {
    const qc = newQc();
    const { result } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });
    expect(result.current.displayMode).toBe('generic');
    expect(result.current.hasProject).toBeFalsy();
  });

  it('displayMode is "without-project" for an authenticated user with no projects', async () => {
    authState.isAuthenticated = true;
    mockedGetAll.mockResolvedValue([]);
    const qc = newQc();
    const { result } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });
    await waitFor(() => expect(mockedGetAll).toHaveBeenCalled());
    expect(result.current.displayMode).toBe('without-project');
  });

  it('displayMode is "with-project" for an authenticated user with at least one project', async () => {
    authState.isAuthenticated = true;
    mockedGetAll.mockResolvedValue([{ idProject: 1 }] as any);
    const qc = newQc();
    const { result } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });
    await waitFor(() => expect(result.current.displayMode).toBe('with-project'));
  });

  it('seeds the destination country from the active project on first mount when none is chosen', async () => {
    authState.isAuthenticated = true;
    activeProjectState.activeProjectId = 1;
    mockedGetAll.mockResolvedValue([
      { idProject: 1, destinationCountry: { isoCode: 'fr' } },
    ] as any);
    const qc = newQc();
    renderHook(() => useServiceContent({ service, category: 'emploi' }), { wrapper: wrapper(qc) });

    await waitFor(() => expect(setSelectedCountry).toHaveBeenCalledWith('france'));
  });

  it('does not override an already-chosen country on the initial seed', async () => {
    authState.isAuthenticated = true;
    destState.countrySlug = 'existing-choice';
    activeProjectState.activeProjectId = 1;
    mockedGetAll.mockResolvedValue([
      { idProject: 1, destinationCountry: { isoCode: 'fr' } },
    ] as any);
    const qc = newQc();
    renderHook(() => useServiceContent({ service, category: 'emploi' }), { wrapper: wrapper(qc) });

    await waitFor(() => expect(mockedGetAll).toHaveBeenCalled());
    expect(setSelectedCountry).not.toHaveBeenCalled();
  });

  it('does not re-seed the country on a re-render for the same active project', async () => {
    authState.isAuthenticated = true;
    activeProjectState.activeProjectId = 1;
    mockedGetAll.mockResolvedValue([
      { idProject: 1, destinationCountry: { isoCode: 'fr' } },
    ] as any);
    const qc = newQc();
    const { rerender } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });

    await waitFor(() => expect(setSelectedCountry).toHaveBeenCalledTimes(1));
    rerender();
    rerender();
    expect(setSelectedCountry).toHaveBeenCalledTimes(1);
  });

  it('overrides the country when the active project genuinely switches after the first seed', async () => {
    authState.isAuthenticated = true;
    activeProjectState.activeProjectId = 1;
    mockedGetAll.mockResolvedValue([
      { idProject: 1, destinationCountry: { isoCode: 'fr' } },
      { idProject: 2, destinationCountry: { isoCode: 'fr' } },
    ] as any);
    destState.countrySlug = 'existing-choice'; // already chosen → first-seed branch is skipped
    const qc = newQc();
    const { rerender } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });
    await waitFor(() => expect(mockedGetAll).toHaveBeenCalled());
    expect(setSelectedCountry).not.toHaveBeenCalled(); // first seed respects the existing choice

    activeProjectState.activeProjectId = 2; // genuine switch to a different project
    rerender();
    await waitFor(() => expect(setSelectedCountry).toHaveBeenCalledWith('france'));
  });

  it('falls back to the last project when the active project id matches nothing', async () => {
    authState.isAuthenticated = true;
    activeProjectState.activeProjectId = 999;
    mockedGetAll.mockResolvedValue([
      { idProject: 1, destinationCountry: { isoCode: 'zz' } },
      { idProject: 2, destinationCountry: { isoCode: 'fr' } },
    ] as any);
    const qc = newQc();
    renderHook(() => useServiceContent({ service, category: 'emploi' }), { wrapper: wrapper(qc) });

    await waitFor(() => expect(setSelectedCountry).toHaveBeenCalledWith('france'));
  });

  it('sorts available cities with the capital first, then alphabetically', () => {
    destState.countrySlug = 'france';
    citiesByCodeState.FR = [
      { name: 'Lyon', isCapital: false },
      { name: 'Bordeaux', isCapital: false },
      { name: 'Paris', isCapital: true },
    ];
    const qc = newQc();
    const { result } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });
    expect(result.current.availableCities.map((c) => c.name)).toEqual([
      'Paris',
      'Bordeaux',
      'Lyon',
    ]);
  });

  it('prefers the active project city over the capital when nothing is selected yet', async () => {
    authState.isAuthenticated = true;
    activeProjectState.activeProjectId = 1;
    destState.countrySlug = 'france';
    citiesByCodeState.FR = [
      { name: 'Lyon', isCapital: false },
      { name: 'Paris', isCapital: true },
    ];
    mockedGetAll.mockResolvedValue([
      {
        idProject: 1,
        destinationCountry: { isoCode: 'fr' },
        destinationCity: { name: 'Lyon' },
      },
    ] as any);
    const qc = newQc();
    renderHook(() => useServiceContent({ service, category: 'emploi' }), { wrapper: wrapper(qc) });

    await waitFor(() => expect(setSelectedCity).toHaveBeenCalledWith('lyon'));
  });

  it('auto-selects the capital city when nothing is currently selected', () => {
    destState.countrySlug = 'france';
    citiesByCodeState.FR = [
      { name: 'Lyon', isCapital: false },
      { name: 'Paris', isCapital: true },
    ];
    const qc = newQc();
    renderHook(() => useServiceContent({ service, category: 'emploi' }), { wrapper: wrapper(qc) });
    expect(setSelectedCity).toHaveBeenCalledWith('paris');
  });

  it('reports no country-specific content when no country is selected', () => {
    const qc = newQc();
    const { result } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });
    expect(result.current.content.hasCountryContent).toBe(false);
    expect(result.current.content.countryName).toBeNull();
  });

  it('reports hasCountryContent=false but keeps the country name when there is no matching content', () => {
    destState.countrySlug = 'france';
    mockedGetCountryContent.mockReturnValue(undefined as any);
    const qc = newQc();
    const { result } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });
    expect(result.current.content.hasCountryContent).toBe(false);
    expect(result.current.content.countryName).toBe('france');
  });

  it('merges country-specific guides, tips, and stats with the base service content', () => {
    destState.countrySlug = 'france';
    mockedGetCountryContent.mockReturnValue({
      specificGuides: [{ title: 'fr guide', steps: ['fr step'] }],
      tips: ['fr tip'],
      stats: [{ label: 'fr stat', value: '42' }],
    } as any);
    const qc = newQc();
    const { result } = renderHook(() => useServiceContent({ service, category: 'emploi' }), {
      wrapper: wrapper(qc),
    });

    expect(result.current.content.hasCountryContent).toBe(true);
    expect(result.current.content.guides).toEqual([
      { title: 'base guide', steps: ['step1'] },
      { title: 'fr guide', steps: ['fr step'] },
    ]);
    expect(result.current.content.tips).toEqual(['base tip', 'fr tip']);
    expect(result.current.content.stats).toEqual([{ label: 'fr stat', value: '42' }]);
  });
});
