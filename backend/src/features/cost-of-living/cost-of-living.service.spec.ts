jest.mock('axios');
jest.mock('./numbeo-parser', () => ({
  fetchNumbeoHtml: jest.fn(),
  parseNumbeo: jest.fn(),
}));
import axios from 'axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CostOfLivingService } from './cost-of-living.service';
import { CostOfLivingCleanerService } from './cost-of-living-cleaner.service';
import { CostOfLivingCache } from './entities/cost-of-living-cache.entity';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { QualityOfLifeService } from '../quality-of-life/quality-of-life.service';
import { PropertyInvestmentService } from '../property-investment/property-investment.service';
import { fetchNumbeoHtml, parseNumbeo } from './numbeo-parser';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFetchNumbeoHtml = fetchNumbeoHtml as jest.Mock;
const mockedParseNumbeo = parseNumbeo as jest.Mock;

const makeMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((x) => x),
  save: jest.fn(async (x) => ({ idCountry: 1, idCity: 1, ...x })),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const validCleanedData = () => ({
  city: { id: 1, name: 'Paris', country: 'France' },
  currency: { code: 'EUR', exchangeRates: { EUR: 1 }, lastUpdated: '2026-01-01' },
  categories: {
    housing: {
      rent: {
        oneBedroom: { cityCenter: { min: 0, avg: 900, max: 0, currency: 'EUR' } },
      },
    },
  },
  summary: { monthlyBudget: { min: 0, avg: 0, max: 0 }, averageSalary: 2500 },
});

describe('CostOfLivingService', () => {
  let service: CostOfLivingService;
  let cacheRepo: ReturnType<typeof makeMockRepo>;
  let cityRepo: ReturnType<typeof makeMockRepo>;
  let countryRepo: ReturnType<typeof makeMockRepo>;
  let cleanerService: { cleanData: jest.Mock };
  let qualityOfLife: { getByCity: jest.Mock };
  let propertyInvestment: { getByCity: jest.Mock };

  const buildService = async () => {
    cacheRepo = makeMockRepo();
    cityRepo = makeMockRepo();
    countryRepo = makeMockRepo();
    cleanerService = { cleanData: jest.fn().mockReturnValue(validCleanedData()) };
    qualityOfLife = { getByCity: jest.fn().mockResolvedValue(undefined) };
    propertyInvestment = { getByCity: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostOfLivingService,
        { provide: CostOfLivingCleanerService, useValue: cleanerService },
        { provide: getRepositoryToken(CostOfLivingCache), useValue: cacheRepo },
        { provide: getRepositoryToken(City), useValue: cityRepo },
        { provide: getRepositoryToken(Country), useValue: countryRepo },
        { provide: QualityOfLifeService, useValue: qualityOfLife },
        { provide: PropertyInvestmentService, useValue: propertyInvestment },
      ],
    }).compile();

    return module.get<CostOfLivingService>(CostOfLivingService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await buildService();
  });

  /** Retry/seed loops use a real setTimeout delay — make it instant for these tests. */
  const withInstantTimers = (run: () => Promise<void>) => async () => {
    const spy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation(((fn: any) => {
        fn();
        return 0 as any;
      }) as any);
    try {
      await run();
    } finally {
      spy.mockRestore();
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCountry (via getCostOfLiving)', () => {
    it('should throw FORBIDDEN for unrecognized country', async () => {
      await expect(service.getCostOfLiving('Paris', 'Narnia')).rejects.toThrow(
        HttpException,
      );
      try {
        await service.getCostOfLiving('Paris', 'Narnia');
      } catch (e) {
        expect((e as HttpException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should normalize country aliases (fr → France)', async () => {
      // Setup mocks to return null (no cache), then fail with SERVICE_UNAVAILABLE (no API key)
      const qb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      cityRepo.createQueryBuilder.mockReturnValue(qb);
      cacheRepo.createQueryBuilder.mockReturnValue(qb);

      // No API key → will throw SERVICE_UNAVAILABLE, but the fact it doesn't throw FORBIDDEN means "fr" was recognized
      await expect(service.getCostOfLiving('Paris', 'fr')).rejects.toThrow(
        HttpException,
      );
      try {
        await service.getCostOfLiving('Paris', 'fr');
      } catch (e) {
        expect((e as HttpException).getStatus()).toBe(
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    });
  });

  describe('getCostOfLiving - memory cache', () => {
    it('should return from memory cache on second call', async () => {
      const fakeData = { city: { name: 'Paris', country: 'France' } };

      // First call: city query builder returns entity with cache
      const cityQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ city_id: 1 }),
      };
      cityRepo.createQueryBuilder.mockReturnValue(cityQb);

      cacheRepo.findOne.mockResolvedValue({
        data: fakeData,
        expiresAt: new Date(Date.now() + 100000),
      });

      const result1 = await service.getCostOfLiving('Paris', 'France');
      expect(result1).toEqual(fakeData);

      // Second call should hit memory cache — no more DB calls
      cacheRepo.findOne.mockClear();
      cityRepo.createQueryBuilder.mockClear();

      const result2 = await service.getCostOfLiving('Paris', 'France');
      expect(result2).toEqual(fakeData);
      // City QB should NOT have been called again since memory cache is used
      expect(cityRepo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('getCachedDataByCityId', () => {
    it('should return data when cache is valid', async () => {
      const fakeData = { city: { name: 'Tokyo' } };
      cacheRepo.findOne.mockResolvedValue({
        data: fakeData,
        expiresAt: new Date(Date.now() + 100000),
      });

      const result = await service.getCachedDataByCityId(42);
      expect(result).toEqual(fakeData);
    });

    it('should return null when cache is expired', async () => {
      cacheRepo.findOne.mockResolvedValue({
        data: { city: { name: 'Tokyo' } },
        expiresAt: new Date(Date.now() - 1000),
      });

      const result = await service.getCachedDataByCityId(42);
      expect(result).toBeNull();
    });

    it('should return null when no cache exists', async () => {
      cacheRepo.findOne.mockResolvedValue(null);
      const result = await service.getCachedDataByCityId(99);
      expect(result).toBeNull();
    });
  });

  describe('getCostOfLiving - DB cache by JSON, no matching city', () => {
    it('should hit the JSON-keyed cache when no city entity matches', async () => {
      const cityQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      const fakeData = { city: { name: 'Geneva', country: 'Switzerland' } };
      const cacheQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ data: fakeData }),
      };
      cityRepo.createQueryBuilder.mockReturnValue(cityQb);
      cacheRepo.createQueryBuilder.mockReturnValue(cacheQb);

      const result = await service.getCostOfLiving('Geneva', 'Switzerland');
      expect(result).toEqual(fakeData);
    });

    it('should throw SERVICE_UNAVAILABLE when nothing cached and no API key configured', async () => {
      const cityQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      const cacheQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      cityRepo.createQueryBuilder.mockReturnValue(cityQb);
      cacheRepo.createQueryBuilder.mockReturnValue(cacheQb);

      await expect(service.getCostOfLiving('Nowhere', 'Japan')).rejects.toThrow(
        HttpException,
      );
    });

    it('should fetch from the API and fire-and-forget persist when a city entity exists but its cache expired', async () => {
      const OLD_ENV = process.env;
      process.env = { ...OLD_ENV, RAPIDAPI_KEY: 'k', RAPIDAPI_HOST: 'h' };
      service = await buildService();

      const cityQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ idCity: 7 }),
      };
      cityRepo.createQueryBuilder.mockReturnValue(cityQb);
      cacheRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // no JSON-keyed cache either
      });
      cacheRepo.findOne
        .mockResolvedValueOnce({
          data: {},
          expiresAt: new Date(Date.now() - 1000),
        }) // stale by-cityId cache
        .mockResolvedValueOnce(null); // persistToDb's own findOne (fire-and-forget)
      mockedAxios.request.mockResolvedValue({ data: {} } as never);

      const result = await service.getCostOfLiving('Paris', 'France');
      expect(result).toEqual(validCleanedData());
      expect(cleanerService.cleanData).toHaveBeenCalled();

      process.env = OLD_ENV;
    });
  });

  describe('updateCostOfLiving()', () => {
    it('should persist and clear the memory cache when the city+country are known', async () => {
      cacheRepo.findOne.mockResolvedValue(null);
      cityRepo.findOne.mockResolvedValue({
        idCity: 1,
        name: 'Paris',
        country: { countryName: 'France' },
      });
      const data = validCleanedData();

      const result = await service.updateCostOfLiving(1, data);

      expect(result).toEqual(data);
      expect(cacheRepo.save).toHaveBeenCalled();
    });

    it('should not fail when the city has no country relation loaded', async () => {
      cacheRepo.findOne.mockResolvedValue(null);
      cityRepo.findOne.mockResolvedValue(null);
      const data = validCleanedData();

      const result = await service.updateCostOfLiving(1, data);
      expect(result).toEqual(data);
    });

    it('should update an existing cache row rather than creating a new one', async () => {
      const existing = { idCache: 5, cityId: 1, data: {} };
      cacheRepo.findOne.mockResolvedValue(existing);
      cityRepo.findOne.mockResolvedValue(null);

      await service.updateCostOfLiving(1, validCleanedData());

      expect(cacheRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ idCache: 5 }),
      );
      expect(cacheRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('fetchAndCache()', () => {
    it('should return the memory cache without refetching when not forcing a refresh', async () => {
      // Prime the memory cache through a first successful fetch.
      cacheRepo.findOne.mockResolvedValue(null);
      mockedAxios.request.mockResolvedValue({ data: {} } as never);

      const first = await service.fetchAndCache(1, 'Paris', 'France');
      expect(first).toEqual(validCleanedData());

      cacheRepo.findOne.mockClear();
      const second = await service.fetchAndCache(1, 'Paris', 'France');
      expect(second).toEqual(validCleanedData());
      expect(cacheRepo.findOne).not.toHaveBeenCalled();
    });

    it('should return DB cache when present and not forcing refresh', async () => {
      const data = validCleanedData();
      cacheRepo.findOne.mockResolvedValue({
        data,
        expiresAt: new Date(Date.now() + 100000),
      });

      const result = await service.fetchAndCache(2, 'Lyon', 'France');
      expect(result).toEqual(data);
    });

    it('should refetch even with valid caches when forceRefresh is true', async () => {
      cacheRepo.findOne.mockResolvedValue({
        data: { some: 'stale' },
        expiresAt: new Date(Date.now() + 100000),
      });
      mockedAxios.request.mockResolvedValue({ data: {} } as never);

      const result = await service.fetchAndCache(3, 'Nice', 'France', true);
      expect(result).toEqual(validCleanedData());
      expect(mockedAxios.request).toHaveBeenCalled();
    });

    it('should not persist obviously empty/zeroed API data', async () => {
      cacheRepo.findOne.mockResolvedValue(null);
      cleanerService.cleanData.mockReturnValue({
        summary: { averageSalary: 0 },
        categories: {
          housing: { rent: { oneBedroom: { cityCenter: { avg: 0 } } } },
        },
      });
      mockedAxios.request.mockResolvedValue({ data: {} } as never);

      const result = await service.fetchAndCache(4, 'Ghost Town', 'France');
      expect(result.summary.averageSalary).toBe(0);
      expect(cacheRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('fetchFromApi (via fetchAndCache) — retries and fallback', () => {
    it(
      'should retry on 429 and eventually succeed',
      withInstantTimers(async () => {
        cacheRepo.findOne.mockResolvedValue(null);
        mockedAxios.request
          .mockRejectedValueOnce({ response: { status: 429 } })
          .mockResolvedValueOnce({ data: {} } as never);

        const result = await service.fetchAndCache(5, 'Zurich', 'Switzerland');
        expect(result).toEqual(validCleanedData());
        expect(mockedAxios.request).toHaveBeenCalledTimes(2);
      }),
    );

    it(
      'should fall back to an empty template after exhausting retries',
      withInstantTimers(async () => {
        cacheRepo.findOne.mockResolvedValue(null);
        mockedAxios.request.mockRejectedValue({ response: { status: 429 } });

        const result = await service.fetchAndCache(
          6,
          'New York City',
          'États-Unis',
        );
        expect(result.summary.averageSalary).toBe(0);
        expect(mockedAxios.request).toHaveBeenCalledTimes(3);
      }),
    );

    it('should fall back to an empty template on a non-retryable error', async () => {
      cacheRepo.findOne.mockResolvedValue(null);
      mockedAxios.request.mockRejectedValue(new Error('boom'));

      const result = await service.fetchAndCache(7, 'Lille', 'France');
      expect(result.summary.averageSalary).toBe(0);
      expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanExpiredCache()', () => {
    it('should return the number of deleted rows', async () => {
      cacheRepo.delete.mockResolvedValue({ affected: 3 });
      const result = await service.cleanExpiredCache();
      expect(result).toBe(3);
    });

    it('should return 0 when affected is undefined', async () => {
      cacheRepo.delete.mockResolvedValue({ affected: undefined });
      const result = await service.cleanExpiredCache();
      expect(result).toBe(0);
    });
  });

  describe('fetchAndStoreCuratedCity()', () => {
    const validRef = { city: 'Nice', country: 'France', slug: 'nice' };

    it('should reject an unsupported country', async () => {
      await expect(
        service.fetchAndStoreCuratedCity({ city: 'Nice', country: 'Narnia' }),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('should reject a blank city name', async () => {
      await expect(
        service.fetchAndStoreCuratedCity({ city: '   ', country: 'France' }),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('should wrap a Numbeo fetch failure as BAD_GATEWAY', async () => {
      mockedFetchNumbeoHtml.mockRejectedValue(new Error('timeout'));
      await expect(
        service.fetchAndStoreCuratedCity(validRef),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_GATEWAY });
    });

    it('should reject when the parsed page has no usable prices', async () => {
      mockedFetchNumbeoHtml.mockResolvedValue('<html></html>');
      mockedParseNumbeo.mockReturnValue({
        summary: { averageSalary: 0 },
        categories: {
          housing: { rent: { oneBedroom: { cityCenter: { avg: 0 } } } },
        },
        meta: {},
      });
      await expect(
        service.fetchAndStoreCuratedCity(validRef),
      ).rejects.toMatchObject({ status: HttpStatus.UNPROCESSABLE_ENTITY });
    });

    it('should resolve an existing city, persist curated data and chain city indices', async () => {
      mockedFetchNumbeoHtml.mockResolvedValue('<html></html>');
      mockedParseNumbeo.mockReturnValue({
        summary: { averageSalary: 3000 },
        categories: {
          housing: {
            rent: { oneBedroom: { cityCenter: { avg: 900, min: 0, max: 0 } } },
          },
        },
        meta: { unavailable: ['taxi'] },
      });
      const cityQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ idCity: 11 }),
      };
      cityRepo.createQueryBuilder.mockReturnValue(cityQb);
      cacheRepo.findOne.mockResolvedValue(null);

      const result = await service.fetchAndStoreCuratedCity(validRef);

      expect(result.cityId).toBe(11);
      expect(result.rentAvg).toBe(900);
      expect(result.pricedFields).toBeGreaterThan(0);
      expect(result.unavailable).toEqual(['taxi']);
      expect(cacheRepo.save).toHaveBeenCalled();
      expect(qualityOfLife.getByCity).toHaveBeenCalledWith(11, {
        refresh: true,
        slugOverride: 'nice',
      });
      expect(propertyInvestment.getByCity).toHaveBeenCalledWith(11, {
        refresh: true,
        slugOverride: 'nice',
      });
    });

    it('should update the existing curated cache row instead of creating a duplicate', async () => {
      mockedFetchNumbeoHtml.mockResolvedValue('<html></html>');
      mockedParseNumbeo.mockReturnValue({
        summary: { averageSalary: 3000 },
        categories: {
          housing: {
            rent: { oneBedroom: { cityCenter: { avg: 900, min: 0, max: 0 } } },
          },
        },
        meta: {},
      });
      const cityQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ idCity: 11 }),
      };
      cityRepo.createQueryBuilder.mockReturnValue(cityQb);
      const existingCacheRow = { idCache: 5, cityId: 11, data: {} };
      cacheRepo.findOne.mockResolvedValue(existingCacheRow);

      await service.fetchAndStoreCuratedCity(validRef);

      expect(cacheRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ idCache: 5 }),
      );
      expect(cacheRepo.create).not.toHaveBeenCalled();
    });

    it('should create the country and city when neither exists, and tolerate a chained-index failure', async () => {
      mockedFetchNumbeoHtml.mockResolvedValue('<html></html>');
      mockedParseNumbeo.mockReturnValue({
        summary: { averageSalary: 3000 },
        categories: {
          housing: {
            rent: { oneBedroom: { cityCenter: { avg: 900, min: 0, max: 0 } } },
          },
        },
        meta: {},
      });
      const cityQb = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      cityRepo.createQueryBuilder.mockReturnValue(cityQb);
      countryRepo.findOne.mockResolvedValue(null);
      cacheRepo.findOne.mockResolvedValue(null);
      qualityOfLife.getByCity.mockRejectedValue(new Error('QoL down'));

      const result = await service.fetchAndStoreCuratedCity(validRef);

      expect(countryRepo.save).toHaveBeenCalled();
      expect(cityRepo.save).toHaveBeenCalled();
      expect(result.cityId).toBeDefined();
    });
  });

  describe('seedAllCities()', () => {
    it(
      'should seed cities with no cache, and skip ones already cached',
      withInstantTimers(async () => {
        // Paris: memory-cacheable after being seeded once via a direct getCostOfLiving-less path
        // is not applicable here — seedAllCities always starts cold, so drive it via DB state.
        const cityQb = {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({ idCity: 1 }),
        };
        cityRepo.createQueryBuilder.mockReturnValue(cityQb);

        let call = 0;
        cacheRepo.createQueryBuilder.mockImplementation(() => {
          call += 1;
          return {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            // First city already cached in DB → skipped; the rest are fresh.
            getOne: jest
              .fn()
              .mockResolvedValue(call === 1 ? { data: validCleanedData() } : null),
          };
        });
        cacheRepo.findOne.mockResolvedValue(null);
        mockedAxios.request.mockResolvedValue({ data: {} } as never);

        const result = await service.seedAllCities();

        expect(result.skipped).toHaveLength(1);
        expect(result.seeded).toHaveLength(3);
        expect(result.errors).toHaveLength(0);
      }),
    );

    it(
      'should skip a city already present in the in-memory cache',
      withInstantTimers(async () => {
        const cityQb = {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({ idCity: 1 }),
        };
        cityRepo.createQueryBuilder.mockReturnValue(cityQb);
        cacheRepo.createQueryBuilder.mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        });
        cacheRepo.findOne.mockResolvedValue(null);
        mockedAxios.request.mockResolvedValue({ data: {} } as never);

        // Prime the in-memory cache for the first supported city (Paris, France).
        (service as any).memCache.set('paris::france', {
          data: validCleanedData(),
          expiresAt: Date.now() + 60_000,
        });

        const result = await service.seedAllCities();

        expect(result.skipped).toEqual(['Paris, France (memory cache)']);
        expect(result.seeded).toHaveLength(3);
      }),
    );

    it(
      'should record an error and continue when a city fails to seed',
      withInstantTimers(async () => {
        const cityQb = {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockRejectedValue(new Error('db down')),
        };
        cityRepo.createQueryBuilder.mockReturnValue(cityQb);
        cacheRepo.createQueryBuilder.mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        });

        const result = await service.seedAllCities();

        expect(result.errors).toHaveLength(4);
        expect(result.seeded).toHaveLength(0);
      }),
    );
  });
});
