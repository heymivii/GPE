import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { searchHintsApi } from './searchHints';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('searchHintsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() GETs /search-hint with the optional filters as params', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await searchHintsApi.list({ country: 'fr', category: 'visa' });
    expect(mockedGet).toHaveBeenCalledWith('/search-hint', {
      params: { country: 'fr', category: 'visa' },
    });
  });

  it('get() GETs /search-hint/:cc/:cat', async () => {
    mockedGet.mockResolvedValue({ data: { id: 1, countryCode: 'FR', category: 'visa' } });
    const result = await searchHintsApi.get('fr', 'visa');
    expect(mockedGet).toHaveBeenCalledWith('/search-hint/fr/visa');
    expect(result.countryCode).toBe('FR');
  });

  it('create() POSTs to /search-hint', async () => {
    mockedPost.mockResolvedValue({ data: { id: 1 } });
    await searchHintsApi.create({ countryCode: 'fr', category: 'visa' });
    expect(mockedPost).toHaveBeenCalledWith('/search-hint', {
      countryCode: 'fr',
      category: 'visa',
    });
  });

  it('update() PATCHes /search-hint/:cc/:cat', async () => {
    mockedPatch.mockResolvedValue({ data: { id: 1, keywords: 'new' } });
    const result = await searchHintsApi.update('fr', 'visa', { keywords: 'new' });
    expect(mockedPatch).toHaveBeenCalledWith('/search-hint/fr/visa', {
      keywords: 'new',
    });
    expect(result.keywords).toBe('new');
  });

  it('remove() DELETEs /search-hint/:cc/:cat', async () => {
    mockedDelete.mockResolvedValue({ data: { deleted: true } });
    const result = await searchHintsApi.remove('fr', 'visa');
    expect(mockedDelete).toHaveBeenCalledWith('/search-hint/fr/visa');
    expect(result).toEqual({ deleted: true });
  });

  it('seed() POSTs to /search-hint/seed', async () => {
    mockedPost.mockResolvedValue({ data: { inserted: 3, skipped: 5, total: 8 } });
    const result = await searchHintsApi.seed();
    expect(mockedPost).toHaveBeenCalledWith('/search-hint/seed');
    expect(result).toEqual({ inserted: 3, skipped: 5, total: 8 });
  });
});
