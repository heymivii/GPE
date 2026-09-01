import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn() },
}));

import api from '../lib/api';
import { searchJobs } from './jobOffers';

const mockedGet = api.get as ReturnType<typeof vi.fn>;

describe('searchJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGet.mockResolvedValue({ data: { results: [], total: 0 } });
  });

  it('builds an empty query string when no params are given', async () => {
    await searchJobs({});
    expect(mockedGet).toHaveBeenCalledWith('/job-offer/search?');
  });

  it('includes only the provided string/number params', async () => {
    await searchJobs({ country: 'fr', keyword: 'dev', page: 2 });
    const url = mockedGet.mock.calls[0][0] as string;
    expect(url).toContain('country=fr');
    expect(url).toContain('keyword=dev');
    expect(url).toContain('page=2');
    expect(url).not.toContain('city=');
  });

  it('serializes boolean flags to "1" only when true', async () => {
    await searchJobs({ fullTime: true, partTime: false, contract: true });
    const url = mockedGet.mock.calls[0][0] as string;
    expect(url).toContain('full_time=1');
    expect(url).toContain('contract=1');
    expect(url).not.toContain('part_time');
  });

  it('serializes the remote flag even when explicitly false', async () => {
    await searchJobs({ remote: false });
    const url = mockedGet.mock.calls[0][0] as string;
    expect(url).toContain('remote=false');
  });

  it('returns the unwrapped response data', async () => {
    mockedGet.mockResolvedValue({ data: { results: [{ id: '1' }], total: 1 } });
    const result = await searchJobs({});
    expect(result).toEqual({ results: [{ id: '1' }], total: 1 });
  });
});
