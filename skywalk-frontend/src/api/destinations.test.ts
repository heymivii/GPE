import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn() },
}));

import apiClient from '../lib/api';
import { destinationsApi } from './destinations';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;

describe('destinationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() GETs /destinations and unwraps the response data', async () => {
    mockedGet.mockResolvedValue({ data: [{ id: 1 }] });
    const result = await destinationsApi.getAll();
    expect(mockedGet).toHaveBeenCalledWith('/destinations');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('getBySlug() GETs /destinations/:slug and unwraps the response data', async () => {
    mockedGet.mockResolvedValue({ data: { id: 1, slug: 'france' } });
    const result = await destinationsApi.getBySlug('france');
    expect(mockedGet).toHaveBeenCalledWith('/destinations/france');
    expect(result).toEqual({ id: 1, slug: 'france' });
  });
});
