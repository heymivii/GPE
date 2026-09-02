import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { continentApi } from './continent';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedPatch = apiClient.patch as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('continentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() GETs /continent', async () => {
    mockedGet.mockResolvedValue({ data: [{ idContinent: 1 }] });
    const result = await continentApi.getAll();
    expect(mockedGet).toHaveBeenCalledWith('/continent');
    expect(result).toEqual([{ idContinent: 1 }]);
  });

  it('create() POSTs to /continent', async () => {
    mockedPost.mockResolvedValue({ data: { idContinent: 1, name: 'Europe' } });
    const result = await continentApi.create({ name: 'Europe' });
    expect(mockedPost).toHaveBeenCalledWith('/continent', { name: 'Europe' });
    expect(result.name).toBe('Europe');
  });

  it('update() PATCHes /continent/:id', async () => {
    mockedPatch.mockResolvedValue({ data: { idContinent: 1, name: 'EU' } });
    const result = await continentApi.update(1, { name: 'EU' });
    expect(mockedPatch).toHaveBeenCalledWith('/continent/1', { name: 'EU' });
    expect(result.name).toBe('EU');
  });

  it('delete() DELETEs /continent/:id', async () => {
    mockedDelete.mockResolvedValue({});
    await continentApi.delete(1);
    expect(mockedDelete).toHaveBeenCalledWith('/continent/1');
  });
});
