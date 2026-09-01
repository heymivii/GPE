import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn() },
}));

import apiClient from '../lib/api';
import { propertyInvestmentApi } from './propertyInvestment';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;

describe('propertyInvestmentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('get() GETs /property-investment with the country as a query param', async () => {
    mockedGet.mockResolvedValue({ data: { country: 'FR' } });
    const result = await propertyInvestmentApi.get('FR');
    expect(mockedGet).toHaveBeenCalledWith('/property-investment', {
      params: { country: 'FR' },
    });
    expect(result).toEqual({ country: 'FR' });
  });
});
