import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { cityApi } from './city';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('cityApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() GETs /city with no params', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await cityApi.getAll();
    expect(mockedGet).toHaveBeenCalledWith('/city');
  });

  it('getActive() GETs /city filtered to status=active', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await cityApi.getActive();
    expect(mockedGet).toHaveBeenCalledWith('/city', { params: { status: 'active' } });
  });

  it('getAvailable() GETs /city/available with the country as a param', async () => {
    mockedGet.mockResolvedValue({ data: ['Paris', 'Lyon'] });
    const result = await cityApi.getAvailable('France');
    expect(mockedGet).toHaveBeenCalledWith('/city/available', {
      params: { country: 'France' },
    });
    expect(result).toEqual(['Paris', 'Lyon']);
  });

  it('getById() GETs /city/:id', async () => {
    mockedGet.mockResolvedValue({ data: { idCity: 1 } });
    await cityApi.getById(1);
    expect(mockedGet).toHaveBeenCalledWith('/city/1');
  });

  it('create() POSTs to /city', async () => {
    mockedPost.mockResolvedValue({ data: { idCity: 1 } });
    await cityApi.create({ name: 'Paris', countryId: 1 });
    expect(mockedPost).toHaveBeenCalledWith('/city', { name: 'Paris', countryId: 1 });
  });

  it('update() PATCHes /city/:id', async () => {
    mockedPatch.mockResolvedValue({ data: { idCity: 1, name: 'Paris' } });
    await cityApi.update(1, { name: 'Paris' });
    expect(mockedPatch).toHaveBeenCalledWith('/city/1', { name: 'Paris' });
  });

  it('delete() DELETEs /city/:id', async () => {
    mockedDelete.mockResolvedValue({});
    await cityApi.delete(1);
    expect(mockedDelete).toHaveBeenCalledWith('/city/1');
  });

  describe('autofill', () => {
    it('sends only the name when no country is given', async () => {
      mockedGet.mockResolvedValue({ data: {} });
      await cityApi.autofill('Paris');
      expect(mockedGet).toHaveBeenCalledWith('/city/autofill', {
        params: { name: 'Paris' },
      });
    });

    it('includes the country when given', async () => {
      mockedGet.mockResolvedValue({ data: {} });
      await cityApi.autofill('Paris', 'France');
      expect(mockedGet).toHaveBeenCalledWith('/city/autofill', {
        params: { name: 'Paris', country: 'France' },
      });
    });
  });

  it('reviewDone() PATCHes /city/:id/review-done with no body', async () => {
    mockedPatch.mockResolvedValue({ data: { idCity: 1 } });
    await cityApi.reviewDone(1);
    expect(mockedPatch).toHaveBeenCalledWith('/city/1/review-done');
  });

  it('approve() PATCHes /city/:id/approve with no body', async () => {
    mockedPatch.mockResolvedValue({ data: { idCity: 1 } });
    await cityApi.approve(1);
    expect(mockedPatch).toHaveBeenCalledWith('/city/1/approve');
  });

  it('reject() PATCHes /city/:id/reject with no body', async () => {
    mockedPatch.mockResolvedValue({ data: { idCity: 1 } });
    await cityApi.reject(1);
    expect(mockedPatch).toHaveBeenCalledWith('/city/1/reject');
  });
});
