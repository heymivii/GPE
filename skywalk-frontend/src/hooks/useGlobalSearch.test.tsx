import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../data/services-config', () => ({
  getServicesConfig: () => ({
    visa: {
      id: 'visa-service',
      title: 'Aide visa',
      subtitle: 'sous-titre',
      description: 'Obtenir un visa rapidement',
    },
  }),
}));

vi.mock('../data/blog-data', () => ({
  BLOG_ARTICLES: [
    { id: 'article-visa', category: 'preparation', coverImage: 'img.jpg' },
  ],
  getArticleTranslation: (id: string, field: string) => `${id}-${field}`,
  getCategoryTranslation: (cat: string) => cat,
}));

vi.mock('../api/globalSearch', () => ({
  globalSearchApi: { search: vi.fn() },
}));

import { globalSearchApi } from '../api/globalSearch';
import { useGlobalSearch } from './useGlobalSearch';

const mockedSearch = vi.mocked(globalSearchApi.search);

describe('useGlobalSearch', () => {
  beforeEach(() => {
    mockedSearch.mockReset();
  });

  it('clears results without calling the API when the query is blank', async () => {
    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => {
      await result.current.search('   ');
    });
    expect(result.current.results).toEqual([]);
    expect(mockedSearch).not.toHaveBeenCalled();
  });

  it('merges DB and static results, deduplicating and sorting by rank', async () => {
    mockedSearch.mockResolvedValue({
      results: [
        { category: 'country', entityId: 'fr', title: 'France', description: '', extra: '', url: null, countryName: '', imageUrl: null, rank: 0.9 },
      ],
      total: 1,
      query: 'visa',
    });

    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => {
      await result.current.search('visa');
    });

    expect(mockedSearch).toHaveBeenCalledWith('visa', undefined, 15);
    // DB (0.9) > service (0.8) > blog (0.75) > faq (0.7): rank-descending order.
    const categories = result.current.results.map((r) => r.category);
    expect(categories).toEqual(['country', 'service', 'blog', 'faq']);
  });

  it('does not call the API for a category-only-static search (service/faq/blog)', async () => {
    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => {
      await result.current.search('visa', 'service');
    });
    expect(mockedSearch).not.toHaveBeenCalled();
    expect(result.current.results.every((r) => r.category === 'service')).toBe(true);
  });

  it('deduplicates a result present in both the DB and static matches', async () => {
    mockedSearch.mockResolvedValue({
      results: [
        { category: 'service', entityId: 'visa-service', title: 'Aide visa (DB)', description: '', extra: '', url: null, countryName: '', imageUrl: null, rank: 1 },
      ],
      total: 1,
      query: 'visa',
    });

    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => {
      await result.current.search('visa');
    });

    const serviceMatches = result.current.results.filter((r) => r.entityId === 'visa-service');
    expect(serviceMatches).toHaveLength(1);
    expect(serviceMatches[0].title).toBe('Aide visa (DB)');
  });

  it('falls back to static-only results and sets an error when the API call fails', async () => {
    mockedSearch.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => {
      await result.current.search('visa');
    });

    expect(result.current.error).toBe('globalSearch.error');
    expect(result.current.results.length).toBeGreaterThan(0);
    expect(result.current.results.every((r) => r.category !== 'country')).toBe(true);
  });

  it('silently ignores an aborted request without setting an error', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    mockedSearch.mockRejectedValue(abortError);

    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => {
      await result.current.search('visa');
    });

    expect(result.current.error).toBeNull();
  });

  it('clear() resets query, results, and error', async () => {
    mockedSearch.mockResolvedValue({ results: [], total: 0, query: 'visa' });
    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => {
      result.current.setQuery('visa');
      await result.current.search('visa');
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
