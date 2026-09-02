import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn() },
}));

import apiClient from '../lib/api';
import { qualityOfLifeApi } from './qualityOfLife';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;

describe('qualityOfLifeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('get() GETs /quality-of-life with the country as a query param', async () => {
    mockedGet.mockResolvedValue({ data: { country: 'FR' } });
    const result = await qualityOfLifeApi.get('FR');
    expect(mockedGet).toHaveBeenCalledWith('/quality-of-life', {
      params: { country: 'FR' },
    });
    expect(result).toEqual({ country: 'FR' });
  });
});
