import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { countryApi } from './country';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('countryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() GETs /country with no params', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await countryApi.getAll();
    expect(mockedGet).toHaveBeenCalledWith('/country');
  });

  it('getActive() GETs /country filtered to status=active', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await countryApi.getActive();
    expect(mockedGet).toHaveBeenCalledWith('/country', { params: { status: 'active' } });
  });

  it('getAvailable() GETs /country/available', async () => {
    mockedGet.mockResolvedValue({ data: [{ code: 'FR', name: 'France' }] });
    const result = await countryApi.getAvailable();
    expect(mockedGet).toHaveBeenCalledWith('/country/available');
    expect(result).toEqual([{ code: 'FR', name: 'France' }]);
  });

  it('getById() GETs /country/:id', async () => {
    mockedGet.mockResolvedValue({ data: { idCountry: 1 } });
    await countryApi.getById(1);
    expect(mockedGet).toHaveBeenCalledWith('/country/1');
  });

  it('create() POSTs to /country', async () => {
    mockedPost.mockResolvedValue({ data: { idCountry: 1 } });
    await countryApi.create({ countryName: 'France', continentId: 1 });
    expect(mockedPost).toHaveBeenCalledWith('/country', {
      countryName: 'France',
      continentId: 1,
    });
  });

  it('update() PATCHes /country/:id', async () => {
    mockedPatch.mockResolvedValue({ data: { idCountry: 1, status: 'archived' } });
    await countryApi.update(1, { status: 'archived' });
    expect(mockedPatch).toHaveBeenCalledWith('/country/1', { status: 'archived' });
  });

  it('delete() DELETEs /country/:id', async () => {
    mockedDelete.mockResolvedValue({});
    await countryApi.delete(1);
    expect(mockedDelete).toHaveBeenCalledWith('/country/1');
  });

  it('approve() PATCHes /country/:id/approve with no body', async () => {
    mockedPatch.mockResolvedValue({ data: { idCountry: 1 } });
    await countryApi.approve(1);
    expect(mockedPatch).toHaveBeenCalledWith('/country/1/approve');
  });

  it('reject() PATCHes /country/:id/reject with no body', async () => {
    mockedPatch.mockResolvedValue({ data: { idCountry: 1 } });
    await countryApi.reject(1);
    expect(mockedPatch).toHaveBeenCalledWith('/country/1/reject');
  });
});
