import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

import apiClient from '../lib/api';
import { cityIndicesApi } from './cityIndices';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPut = apiClient.put as ReturnType<typeof vi.fn>;

describe('cityIndicesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getQualityOfLife() GETs the cache-only city endpoint', async () => {
    mockedGet.mockResolvedValue({ data: null });
    const result = await cityIndicesApi.getQualityOfLife(5);
    expect(mockedGet).toHaveBeenCalledWith('/quality-of-life/city/5');
    expect(result).toBeNull();
  });

  it('getPropertyInvestment() GETs the cache-only city endpoint', async () => {
    mockedGet.mockResolvedValue({ data: null });
    const result = await cityIndicesApi.getPropertyInvestment(5);
    expect(mockedGet).toHaveBeenCalledWith('/property-investment/city/5');
    expect(result).toBeNull();
  });

  describe('fetchQualityOfLife', () => {
    it('sends only cityId when no slug override is given', async () => {
      mockedPost.mockResolvedValue({ data: { cityId: 5 } });
      await cityIndicesApi.fetchQualityOfLife(5);
      expect(mockedPost).toHaveBeenCalledWith('/quality-of-life/admin/fetch-city', {
        cityId: 5,
      });
    });

    it('includes the slug override when given', async () => {
      mockedPost.mockResolvedValue({ data: { cityId: 5 } });
      await cityIndicesApi.fetchQualityOfLife(5, 'Paris');
      expect(mockedPost).toHaveBeenCalledWith('/quality-of-life/admin/fetch-city', {
        cityId: 5,
        slug: 'Paris',
      });
    });
  });

  describe('fetchPropertyInvestment', () => {
    it('sends only cityId when no slug override is given', async () => {
      mockedPost.mockResolvedValue({ data: { cityId: 5 } });
      await cityIndicesApi.fetchPropertyInvestment(5);
      expect(mockedPost).toHaveBeenCalledWith('/property-investment/admin/fetch-city', {
        cityId: 5,
      });
    });
  });

  it('updateQualityOfLife() PUTs the manual values to the city endpoint', async () => {
    mockedPut.mockResolvedValue({ data: { cityId: 5, safety: 70 } });
    const result = await cityIndicesApi.updateQualityOfLife(5, { safety: 70 });
    expect(mockedPut).toHaveBeenCalledWith('/quality-of-life/city/5', { safety: 70 });
    expect(result.safety).toBe(70);
  });

  it('updatePropertyInvestment() PUTs the manual values to the city endpoint', async () => {
    mockedPut.mockResolvedValue({ data: { cityId: 5, gdpPerCapita: 40000 } });
    const result = await cityIndicesApi.updatePropertyInvestment(5, { gdpPerCapita: 40000 });
    expect(mockedPut).toHaveBeenCalledWith('/property-investment/city/5', {
      gdpPerCapita: 40000,
    });
    expect(result.gdpPerCapita).toBe(40000);
  });
});
