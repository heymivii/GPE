import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn() },
}));

import apiClient from '../lib/api';
import { migrationApi } from './migration';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;

describe('migrationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll() GETs /migration and unwraps the response data', async () => {
    mockedGet.mockResolvedValue({ data: [{ countryCode: 'FRA' }] });
    const result = await migrationApi.getAll();
    expect(mockedGet).toHaveBeenCalledWith('/migration');
    expect(result).toEqual([{ countryCode: 'FRA' }]);
  });

  it('getByCountry() GETs /migration/:code and unwraps the response data', async () => {
    mockedGet.mockResolvedValue({ data: { countryCode: 'FRA' } });
    const result = await migrationApi.getByCountry('fr');
    expect(mockedGet).toHaveBeenCalledWith('/migration/fr');
    expect(result).toEqual({ countryCode: 'FRA' });
  });

  it('getByCountry() propagates a null result', async () => {
    mockedGet.mockResolvedValue({ data: null });
    const result = await migrationApi.getByCountry('zz');
    expect(result).toBeNull();
  });
});
