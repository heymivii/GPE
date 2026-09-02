import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../../api/jobOffers', () => ({ searchJobs: vi.fn() }));
// Stable references across renders (like the real hook) — an inline object/function
// here would get a new identity every render, breaking the hook's own useCallback
// memoization and looping its filters-changed effect forever.
const stableT = (k: string) => k;
const stableI18n = { language: 'fr' };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: stableT, i18n: stableI18n }),
}));

import { searchJobs } from '../../../api/jobOffers';
import useSearch from './useSearch';

const mockedSearchJobs = vi.mocked(searchJobs);

const makeJob = (overrides: any = {}) => ({
  id: '1',
  title: 'Développeur',
  description: 'desc',
  location: { city: 'Paris', country: 'fr', displayName: 'Paris, France' },
  salary: { min: 40000, max: 50000, currency: 'EUR', period: 'year' },
  contract_type: 'permanent',
  remote: true,
  redirect_url: 'https://example.com/1',
  created_at: '2026-01-01T00:00:00Z',
  category: 'IT',
  company: 'Acme',
  ...overrides,
});

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('loads recent searches and saved filters from localStorage on mount', () => {
    localStorage.setItem('skywalk-recent-searches', JSON.stringify(['dev paris']));
    localStorage.setItem('skywalk-saved-filters', JSON.stringify([{ name: 'x' }]));

    const { result } = renderHook(() => useSearch());

    expect(result.current.recentSearches).toEqual(['dev paris']);
    expect(result.current.savedFilters).toEqual([{ name: 'x' }]);
  });

  it('does not auto-search on initial mount', () => {
    renderHook(() => useSearch());
    expect(mockedSearchJobs).not.toHaveBeenCalled();
  });

  it('updateFilters merges partial filters and resets to page 1', async () => {
    mockedSearchJobs.mockResolvedValue({ results: [], total: 0, page: 1, perPage: 20, totalPages: 0 });
    const { result } = renderHook(() => useSearch());

    act(() => result.current.updateFilters({ priceRange: [100, 5000] }));

    expect(result.current.filters.priceRange).toEqual([100, 5000]);
    expect(result.current.currentPage).toBe(1);
    // Any filters change recreates `search` (it depends on the whole filters object),
    // which re-triggers the auto-search effect — so even a priceRange-only change
    // re-runs the default 'fr' search and feeds it into salaryMin/salaryMax.
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockedSearchJobs).toHaveBeenCalledWith(
      expect.objectContaining({ salaryMin: 100, salaryMax: 5000 }),
    );
  });

  it('auto-searches when a watched filter (e.g. query) changes, and skips the API for non-job categories', async () => {
    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ category: 'immobilier' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockedSearchJobs).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it('skips the API call when the resolved country is not Adzuna-supported', async () => {
    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ country: 'Japon' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockedSearchJobs).not.toHaveBeenCalled();
  });

  it('resolves the query into country/city/keyword, calls searchJobs, and maps the results', async () => {
    mockedSearchJobs.mockResolvedValue({
      results: [makeJob()],
      total: 1,
      page: 1,
      perPage: 20,
      totalPages: 1,
    });

    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ query: 'developpeur paris' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedSearchJobs).toHaveBeenCalledWith(
      expect.objectContaining({ country: 'fr', city: 'Paris', keyword: 'developer' }),
    );
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0]).toMatchObject({
      id: '1',
      title: 'Développeur',
      city: 'Paris',
      provider: 'Adzuna',
    });
    expect(result.current.results[0].tags).toEqual(['Acme', 'permanent', 'Remote', 'IT']);
    expect(result.current.totalResults).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it('persists a non-empty raw query into recent searches, most-recent first and deduped', async () => {
    localStorage.setItem('skywalk-recent-searches', JSON.stringify(['developpeur paris', 'old search']));
    mockedSearchJobs.mockResolvedValue({ results: [], total: 0, page: 1, perPage: 20, totalPages: 0 });

    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ query: 'developpeur paris' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const stored = JSON.parse(localStorage.getItem('skywalk-recent-searches')!);
    expect(stored[0]).toBe('developpeur paris');
    expect(stored.filter((s: string) => s === 'developpeur paris')).toHaveLength(1);
  });

  it('clears results and stops loading when the API call fails', async () => {
    mockedSearchJobs.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ query: 'developpeur paris' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.results).toEqual([]);
  });

  it('loadMore() appends results and advances the page while more pages remain', async () => {
    mockedSearchJobs.mockResolvedValueOnce({
      results: [makeJob({ id: '1' })],
      total: 2,
      page: 1,
      perPage: 20,
      totalPages: 2,
    });

    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ query: 'developpeur paris' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasMore).toBe(true);

    mockedSearchJobs.mockResolvedValueOnce({
      results: [makeJob({ id: '2' })],
      total: 2,
      page: 2,
      perPage: 20,
      totalPages: 2,
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.results.map((r) => r.id)).toEqual(['1', '2']);
    expect(result.current.currentPage).toBe(2);
    expect(result.current.hasMore).toBe(false);
  });

  it('sorts results by salary, ascending or descending', async () => {
    mockedSearchJobs.mockResolvedValue({
      results: [
        makeJob({ id: '1', salary: { min: 30000, currency: 'EUR' } }),
        makeJob({ id: '2', salary: { min: 50000, currency: 'EUR' } }),
      ],
      total: 2,
      page: 1,
      perPage: 20,
      totalPages: 1,
    });

    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ query: 'developpeur paris', sortBy: 'salary', sortOrder: 'desc' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.results.map((r) => r.id)).toEqual(['2', '1']);

    act(() => result.current.updateFilters({ sortOrder: 'asc' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.results.map((r) => r.id)).toEqual(['1', '2']);
  });

  it('aborts an in-flight search when a new one starts before it resolves', async () => {
    let resolveFirst!: (v: any) => void;
    mockedSearchJobs.mockImplementationOnce(
      () => new Promise((resolve) => { resolveFirst = resolve; }),
    );
    mockedSearchJobs.mockResolvedValueOnce({ results: [], total: 0, page: 1, perPage: 20, totalPages: 0 });

    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ query: 'developpeur paris' }));
    // Still loading (first call pending) — trigger a second search before it resolves.
    await act(async () => {
      result.current.search();
    });

    resolveFirst({ results: [], total: 0, page: 1, perPage: 20, totalPages: 0 });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockedSearchJobs).toHaveBeenCalledTimes(2);
  });

  it('loadMore() is a no-op for a non-job category', async () => {
    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ category: 'immobilier' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedSearchJobs.mockClear();
    await act(async () => {
      await result.current.loadMore();
    });
    expect(mockedSearchJobs).not.toHaveBeenCalled();
  });

  it('loadMore() is a no-op when the resolved country is not Adzuna-supported', async () => {
    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ country: 'Japon' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedSearchJobs.mockClear();
    await act(async () => {
      await result.current.loadMore();
    });
    expect(mockedSearchJobs).not.toHaveBeenCalled();
  });

  it('loadMore() logs an error without crashing when the API call fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedSearchJobs.mockResolvedValueOnce({
      results: [makeJob()],
      total: 2,
      page: 1,
      perPage: 20,
      totalPages: 2,
    });

    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ query: 'developpeur paris' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedSearchJobs.mockRejectedValueOnce(new Error('network down'));
    await act(async () => {
      await result.current.loadMore();
    });

    expect(errorSpy).toHaveBeenCalledWith('Load more results error:', expect.any(Error));
    errorSpy.mockRestore();
  });

  it('loadMore() is a no-op once hasMore is false', async () => {
    mockedSearchJobs.mockResolvedValueOnce({
      results: [makeJob()],
      total: 1,
      page: 1,
      perPage: 20,
      totalPages: 1,
    });

    const { result } = renderHook(() => useSearch());
    act(() => result.current.updateFilters({ query: 'developpeur paris' }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasMore).toBe(false);

    mockedSearchJobs.mockClear();
    await act(async () => {
      await result.current.loadMore();
    });
    expect(mockedSearchJobs).not.toHaveBeenCalled();
  });

  it('saveFilters() persists a named filter set to localStorage, deduped by name and capped at 5', () => {
    const existing = Array.from({ length: 5 }, (_, i) => ({ name: `f${i}`, filters: {}, date: '' }));
    localStorage.setItem('skywalk-saved-filters', JSON.stringify(existing));

    const { result } = renderHook(() => useSearch());
    act(() => result.current.saveFilters('new-filter'));

    const stored = JSON.parse(localStorage.getItem('skywalk-saved-filters')!);
    expect(stored).toHaveLength(5);
    expect(stored[0].name).toBe('new-filter');
  });
});
