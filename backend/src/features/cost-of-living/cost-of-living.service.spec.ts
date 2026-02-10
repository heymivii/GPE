import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CostOfLivingService } from './cost-of-living.service';
import { CostOfLivingCleanerService } from './cost-of-living-cleaner.service';
import { CostOfLivingCache } from './entities/cost-of-living-cache.entity';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';

const makeMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('CostOfLivingService', () => {
  let service: CostOfLivingService;
  let cacheRepo: ReturnType<typeof makeMockRepo>;
  let cityRepo: ReturnType<typeof makeMockRepo>;
  let countryRepo: ReturnType<typeof makeMockRepo>;

  beforeEach(async () => {
    cacheRepo = makeMockRepo();
    cityRepo = makeMockRepo();
    countryRepo = makeMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostOfLivingService,
        { provide: CostOfLivingCleanerService, useValue: { clean: jest.fn() } },
        { provide: getRepositoryToken(CostOfLivingCache), useValue: cacheRepo },
        { provide: getRepositoryToken(City), useValue: cityRepo },
        { provide: getRepositoryToken(Country), useValue: countryRepo },
      ],
    }).compile();

    service = module.get<CostOfLivingService>(CostOfLivingService);
  });

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
});
