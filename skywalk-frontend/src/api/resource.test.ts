import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { resourceApi } from './resource';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('resourceApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() GETs /resource with no params', async () => {
    mockedGet.mockResolvedValue({ data: [{ idResource: 1 }] });
    const result = await resourceApi.getAll();
    expect(mockedGet).toHaveBeenCalledWith('/resource');
    expect(result).toEqual([{ idResource: 1 }]);
  });

  it('getByCountry() GETs /resource with countryId as a query param', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await resourceApi.getByCountry(3);
    expect(mockedGet).toHaveBeenCalledWith('/resource', { params: { countryId: 3 } });
  });

  it('getById() GETs /resource/:id', async () => {
    mockedGet.mockResolvedValue({ data: { idResource: 1 } });
    const result = await resourceApi.getById(1);
    expect(mockedGet).toHaveBeenCalledWith('/resource/1');
    expect(result).toEqual({ idResource: 1 });
  });

  it('create() POSTs to /resource', async () => {
    mockedPost.mockResolvedValue({ data: { idResource: 1 } });
    await resourceApi.create({ title: 'x', countryId: 1 });
    expect(mockedPost).toHaveBeenCalledWith('/resource', { title: 'x', countryId: 1 });
  });

  it('update() PATCHes /resource/:id', async () => {
    mockedPatch.mockResolvedValue({ data: { idResource: 1, title: 'new' } });
    const result = await resourceApi.update(1, { title: 'new' });
    expect(mockedPatch).toHaveBeenCalledWith('/resource/1', { title: 'new' });
    expect(result.title).toBe('new');
  });

  it('delete() DELETEs /resource/:id', async () => {
    mockedDelete.mockResolvedValue({});
    await resourceApi.delete(1);
    expect(mockedDelete).toHaveBeenCalledWith('/resource/1');
  });
});
