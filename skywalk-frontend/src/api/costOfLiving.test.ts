import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

import apiClient from '../lib/api';
import { costOfLivingApi } from './costOfLiving';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPut = apiClient.put as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;

describe('costOfLivingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCostOfLiving() GETs /cost-of-living/search with city and country params', async () => {
    mockedGet.mockResolvedValue({ data: { city: { name: 'Paris' } } });
    const result = await costOfLivingApi.getCostOfLiving('Paris', 'France');
    expect(mockedGet).toHaveBeenCalledWith('/cost-of-living/search', {
      params: { city: 'Paris', country: 'France' },
    });
    expect(result).toEqual({ city: { name: 'Paris' } });
  });

  it('updateCostOfLiving() PUTs the full data payload to /cost-of-living/:cityId', async () => {
    const payload = { city: { id: 1, name: 'Paris' } } as any;
    mockedPut.mockResolvedValue({ data: payload });
    await costOfLivingApi.updateCostOfLiving(1, payload);
    expect(mockedPut).toHaveBeenCalledWith('/cost-of-living/1', payload);
  });

  it('adminFetch() POSTs to /cost-of-living/admin/fetch', async () => {
    mockedPost.mockResolvedValue({ data: { cityId: 1 } });
    const input = { city: 'Paris', country: 'France' };
    await costOfLivingApi.adminFetch(input);
    expect(mockedPost).toHaveBeenCalledWith('/cost-of-living/admin/fetch', input);
  });
});
