import axios from 'axios';
import { HttpException } from '@nestjs/common';
import { AdzunaService } from './adzuna.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AdzunaService', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  const makeService = (withCredentials = true) => {
    process.env = {
      ...originalEnv,
      ADZUNA_APP_ID: withCredentials ? 'id' : '',
      ADZUNA_APP_KEY: withCredentials ? 'key' : '',
    };
    return new AdzunaService();
  };

  it('throws when Adzuna credentials are not configured', async () => {
    const service = makeService(false);
    await expect(service.searchJobs({ country: 'fr' } as any)).rejects.toThrow(
      HttpException,
    );
  });

  it('returns an empty result set for unsupported countries', async () => {
    const service = makeService(true);
    const result = await service.searchJobs({ country: 'zz' } as any);
    expect(result).toEqual({
      results: [],
      total: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
    });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('normalizes a successful Adzuna response', async () => {
    const service = makeService(true);
    mockedAxios.get.mockResolvedValue({
      data: {
        count: 1,
        results: [
          {
            id: '123',
            title: 'Développeur remote',
            company: { display_name: 'Acme' },
            location: { display_name: 'Paris, France' },
            description: 'Poste en télétravail',
            salary_min: 45000,
            salary_max: 55000,
            contract_type: 'permanent',
            redirect_url: 'https://example.com/job/123',
            created: '2026-01-01T00:00:00Z',
            category: { label: 'IT' },
          },
        ],
      },
    });

    const result = await service.searchJobs({
      country: 'fr',
      resultsPerPage: 20,
      page: 1,
    } as any);

    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    const job = result.results[0];
    expect(job.company).toBe('Acme');
    expect(job.location.city).toBe('Paris');
    expect(job.remote).toBe(true);
    expect(job.salary).toEqual({
      min: 45000,
      max: 55000,
      currency: 'EUR',
      period: 'year',
    });
  });

  it('defaults company name and marks salary undefined when absent', async () => {
    const service = makeService(true);
    mockedAxios.get.mockResolvedValue({
      data: {
        count: 1,
        results: [
          {
            id: '1',
            title: 'Poste sans salaire',
            company: {},
            location: {},
            description: 'rien',
            created: '2026-01-01T00:00:00Z',
          },
        ],
      },
    });

    const result = await service.searchJobs({ country: 'fr' } as any);

    expect(result.results[0].company).toBe('Non spécifié');
    expect(result.results[0].salary).toBeUndefined();
    expect(result.results[0].remote).toBe(false);
  });

  it('serves cached results on a second identical call without hitting the API again', async () => {
    const service = makeService(true);
    mockedAxios.get.mockResolvedValue({
      data: { count: 0, results: [] },
    });

    const dto = { country: 'fr', keyword: 'dev' } as any;
    await service.searchJobs(dto);
    await service.searchJobs(dto);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('wraps an Axios error into an HttpException using the response status', async () => {
    const service = makeService(true);
    const axiosError: any = {
      isAxiosError: true,
      response: { status: 429, data: { message: 'rate limited' } },
      message: 'Request failed',
    };
    mockedAxios.get.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(
      service.searchJobs({ country: 'fr' } as any),
    ).rejects.toMatchObject({ status: 429 });
  });

  it('wraps a non-Axios error into a 502 HttpException', async () => {
    const service = makeService(true);
    mockedAxios.get.mockRejectedValue(new Error('boom'));
    mockedAxios.isAxiosError.mockReturnValue(false);

    await expect(
      service.searchJobs({ country: 'fr' } as any),
    ).rejects.toMatchObject({ status: 502 });
  });

  it('builds the API URL with every optional filter (what_exclude, city, category, salary range, date sort, single contract filter, max_days_old)', async () => {
    const service = makeService(true);
    mockedAxios.get.mockResolvedValue({ data: { count: 0, results: [] } });

    await service.searchJobs({
      country: 'fr',
      keyword: 'dev',
      what_exclude: 'stage',
      city: 'Lyon',
      category: 'it-jobs',
      salaryMin: 30000,
      salaryMax: 60000,
      sortBy: 'date',
      full_time: true,
      max_days_old: 7,
    } as any);

    const calledUrl = mockedAxios.get.mock.calls[0][0] as string;
    expect(calledUrl).toContain('what_exclude=stage');
    expect(calledUrl).toContain('where=Lyon');
    expect(calledUrl).toContain('category=it-jobs');
    expect(calledUrl).toContain('salary_min=30000');
    expect(calledUrl).toContain('salary_max=60000');
    expect(calledUrl).toContain('sort_by=date');
    expect(calledUrl).toContain('full_time=1');
    expect(calledUrl).toContain('max_days_old=7');
  });

  it('sorts by salary when sortBy=salary, and omits the contract filter when several are set', async () => {
    const service = makeService(true);
    mockedAxios.get.mockResolvedValue({ data: { count: 0, results: [] } });

    await service.searchJobs({
      country: 'fr',
      sortBy: 'salary',
      full_time: true,
      part_time: true,
    } as any);

    const calledUrl = mockedAxios.get.mock.calls[0][0] as string;
    expect(calledUrl).toContain('sort_by=salary');
    expect(calledUrl).not.toContain('full_time=1');
    expect(calledUrl).not.toContain('part_time=1');
  });

  it('expires cached results after the TTL and refetches from the API', async () => {
    const service = makeService(true);
    mockedAxios.get.mockResolvedValue({ data: { count: 0, results: [] } });
    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValue(1_000_000);

    const dto = { country: 'fr', keyword: 'stale' } as any;
    await service.searchJobs(dto);
    nowSpy.mockReturnValue(1_000_000 + 60 * 60 * 1000 + 1);
    await service.searchJobs(dto);

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    nowSpy.mockRestore();
  });

  describe('clearExpiredCache()', () => {
    it('removes stale entries so a later identical search refetches', async () => {
      const service = makeService(true);
      mockedAxios.get.mockResolvedValue({ data: { count: 0, results: [] } });
      const nowSpy = jest.spyOn(Date, 'now');
      nowSpy.mockReturnValue(1_000_000);

      const dto = { country: 'fr', keyword: 'to-clean' } as any;
      await service.searchJobs(dto);
      nowSpy.mockReturnValue(1_000_000 + 60 * 60 * 1000 + 1);
      service.clearExpiredCache();
      await service.searchJobs(dto);

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      nowSpy.mockRestore();
    });

    it('is a no-op when the cache is empty', () => {
      const service = makeService(true);
      expect(() => service.clearExpiredCache()).not.toThrow();
    });
  });
});
