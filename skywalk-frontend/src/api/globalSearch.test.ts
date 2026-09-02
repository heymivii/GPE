import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn() },
}));

import apiClient from '../lib/api';
import { globalSearchApi } from './globalSearch';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;

describe('globalSearchApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGet.mockResolvedValue({ data: { results: [], total: 0, query: 'paris' } });
  });

  it('defaults the limit to 10 and omits the category when not given', async () => {
    await globalSearchApi.search('paris');
    expect(mockedGet).toHaveBeenCalledWith('/global-search', {
      params: { q: 'paris', limit: 10 },
    });
  });

  it('includes the category when given', async () => {
    await globalSearchApi.search('paris', 'city', 5);
    expect(mockedGet).toHaveBeenCalledWith('/global-search', {
      params: { q: 'paris', limit: 5, category: 'city' },
    });
  });

  it('returns the unwrapped response data', async () => {
    mockedGet.mockResolvedValue({
      data: { results: [{ entityId: '1' }], total: 1, query: 'paris' },
    });
    const result = await globalSearchApi.search('paris');
    expect(result.total).toBe(1);
  });
});
