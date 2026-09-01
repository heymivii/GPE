import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import apiClient from '../lib/api';
import { govLinksApi } from './govLinks';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;

describe('govLinksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() GETs /gov-links with the optional filters as params', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await govLinksApi.list({ country: 'FR', category: 'visa' });
    expect(mockedGet).toHaveBeenCalledWith('/gov-links', {
      params: { country: 'FR', category: 'visa' },
    });
  });

  it('generate() POSTs with no body and country/category as params', async () => {
    mockedPost.mockResolvedValue({ data: { countryCode: 'FR', category: 'visa' } });
    await govLinksApi.generate('FR', 'visa');
    expect(mockedPost).toHaveBeenCalledWith('/gov-links/generate', undefined, {
      params: { country: 'FR', category: 'visa' },
    });
  });

  it('health() GETs /gov-links/health', async () => {
    mockedGet.mockResolvedValue({ data: { llm: {}, search: {} } });
    await govLinksApi.health();
    expect(mockedGet).toHaveBeenCalledWith('/gov-links/health');
  });

  it('approveLink() PATCHes /gov-links/:id/approve with no body', async () => {
    mockedPatch.mockResolvedValue({ data: { id: 1, status: 'active' } });
    const result = await govLinksApi.approveLink(1);
    expect(mockedPatch).toHaveBeenCalledWith('/gov-links/1/approve');
    expect(result.status).toBe('active');
  });

  it('rejectLink() PATCHes /gov-links/:id/reject with no body', async () => {
    mockedPatch.mockResolvedValue({ data: { id: 1, status: 'dead' } });
    await govLinksApi.rejectLink(1);
    expect(mockedPatch).toHaveBeenCalledWith('/gov-links/1/reject');
  });

  it('getSupportedCountries() GETs /gov-links/supported-countries', async () => {
    mockedGet.mockResolvedValue({ data: [{ code: 'FR' }] });
    const result = await govLinksApi.getSupportedCountries();
    expect(mockedGet).toHaveBeenCalledWith('/gov-links/supported-countries');
    expect(result).toEqual([{ code: 'FR' }]);
  });

  it('generateCountry() POSTs with no body and the country as a param', async () => {
    mockedPost.mockResolvedValue({ data: { runId: 5 } });
    const result = await govLinksApi.generateCountry('FR');
    expect(mockedPost).toHaveBeenCalledWith('/gov-links/generate-country', undefined, {
      params: { country: 'FR' },
    });
    expect(result).toEqual({ runId: 5 });
  });

  it('getRun() GETs /gov-links/runs/:id', async () => {
    mockedGet.mockResolvedValue({ data: { id: 5, status: 'done' } });
    const result = await govLinksApi.getRun(5);
    expect(mockedGet).toHaveBeenCalledWith('/gov-links/runs/5');
    expect(result.status).toBe('done');
  });

  describe('getLatestRun', () => {
    it('returns the latest run when found', async () => {
      mockedGet.mockResolvedValue({ data: { id: 5, status: 'done' } });
      const result = await govLinksApi.getLatestRun('FR');
      expect(mockedGet).toHaveBeenCalledWith('/gov-links/runs/latest', {
        params: { country: 'FR' },
      });
      expect(result?.id).toBe(5);
    });

    it('returns null when the backend responds 404 (no run yet)', async () => {
      mockedGet.mockRejectedValue({ response: { status: 404 } });
      const result = await govLinksApi.getLatestRun('FR');
      expect(result).toBeNull();
    });

    it('rethrows non-404 errors', async () => {
      const error = { response: { status: 500 } };
      mockedGet.mockRejectedValue(error);
      await expect(govLinksApi.getLatestRun('FR')).rejects.toBe(error);
    });
  });

  it('rerunCategory() POSTs with no body and the category as a param', async () => {
    mockedPost.mockResolvedValue({ data: { id: 5, status: 'running' } });
    await govLinksApi.rerunCategory(5, 'visa');
    expect(mockedPost).toHaveBeenCalledWith('/gov-links/runs/5/rerun', undefined, {
      params: { category: 'visa' },
    });
  });
});
