jest.mock('axios');
jest.mock('../../services/restCountries.service', () => ({
  __esModule: true,
  default: { getCitiesByCountry: jest.fn() },
}));
import axios from 'axios';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { City } from './entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { ReviewService } from '../review/review.service';
import restCountriesService from '../../services/restCountries.service';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedRestCountries = restCountriesService as jest.Mocked<
  typeof restCountriesService
>;

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((x) => x),
  save: jest.fn(async (x) => x),
  remove: jest.fn(),
  manager: {
    transaction: jest.fn(),
    findOne: jest.fn(),
  },
});

const mockReviewService = () => ({
  notifyAdminsOfPending: jest.fn(),
  notifyAuthorOfDecision: jest.fn(),
  notifyUser: jest.fn(),
  nameOf: jest.fn().mockResolvedValue('Admin Test'),
  assertNotSelfReview: jest.fn(),
});

describe('CityService', () => {
  let service: CityService;
  let repo: ReturnType<typeof mockRepo>;
  let review: ReturnType<typeof mockReviewService>;

  beforeEach(async () => {
    repo = mockRepo();
    review = mockReviewService();
    repo.manager.transaction.mockImplementation(async (handler: any) =>
      handler({ query: jest.fn() }),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        {
          provide: getRepositoryToken(City),
          useValue: repo,
        },
        {
          provide: ReviewService,
          useValue: review,
        },
      ],
    }).compile();

    service = module.get<CityService>(CityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return all cities without status filter when no arg provided', async () => {
      repo.find.mockResolvedValue([{ idCity: 1 }, { idCity: 2 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
      const callArg = repo.find.mock.calls[0][0];
      expect(callArg?.where?.status).toBeUndefined();
    });

    it('should filter by status when status arg is provided', async () => {
      repo.find.mockResolvedValue([{ idCity: 1, status: 'active' }]);
      const result = await service.findAll('active');
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'active' } }),
      );
    });
  });

  describe('findByCountry()', () => {
    it('should filter by countryId without status filter when no status provided', async () => {
      repo.find.mockResolvedValue([{ idCity: 3, countryId: 10 }]);
      const result = await service.findByCountry(10);
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { countryId: 10 } }),
      );
      const callArg = repo.find.mock.calls[0][0];
      expect(callArg.where.status).toBeUndefined();
    });

    it('should combine countryId and status filter when both provided', async () => {
      repo.find.mockResolvedValue([
        { idCity: 3, countryId: 10, status: 'active' },
      ]);
      const result = await service.findByCountry(10, 'active');
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { countryId: 10, status: 'active' } }),
      );
    });

    it('should apply only status filter when status provided without countryId', async () => {
      // findByCountry always has a countryId, but we also test findAll with status
      repo.find.mockResolvedValue([{ idCity: 5, status: 'active' }]);
      await service.findAll('active');
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'active' } }),
      );
    });
  });

  describe('remove()', () => {
    it('should delete dependent city rows before removing the city itself', async () => {
      const query = jest.fn();
      repo.manager.transaction.mockImplementation(async (handler: any) =>
        handler({ query }),
      );

      await service.remove(42);

      expect(repo.manager.transaction).toHaveBeenCalled();
      expect(query).toHaveBeenNthCalledWith(
        1,
        'DELETE FROM "cost_of_living_cache" WHERE "city_id" = $1',
        [42],
      );
      expect(query).toHaveBeenNthCalledWith(
        2,
        'DELETE FROM "cost_of_living" WHERE "city_id" = $1',
        [42],
      );
      expect(query).toHaveBeenNthCalledWith(
        3,
        'DELETE FROM "job_offer" WHERE "city_id" = $1',
        [42],
      );
      expect(query).toHaveBeenNthCalledWith(
        4,
        'DELETE FROM "city_comparison" WHERE "city_id" = $1',
        [42],
      );
      expect(query).toHaveBeenNthCalledWith(
        5,
        'DELETE FROM "expatriation_project" WHERE "destination_city_id" = $1',
        [42],
      );
      expect(query).toHaveBeenNthCalledWith(
        6,
        'DELETE FROM "city" WHERE "id_city" = $1',
        [42],
      );
    });
  });

  describe('getAvailableCities()', () => {
    it('should return [] without hitting the API when country is empty', async () => {
      const result = await service.getAvailableCities('');
      expect(result).toEqual([]);
      expect(mockedRestCountries.getCitiesByCountry).not.toHaveBeenCalled();
    });

    it('should delegate to restCountriesService when country is provided', async () => {
      mockedRestCountries.getCitiesByCountry.mockResolvedValue([
        'Lyon',
        'Paris',
      ]);
      const result = await service.getAvailableCities('France');
      expect(result).toEqual(['Lyon', 'Paris']);
      expect(mockedRestCountries.getCitiesByCountry).toHaveBeenCalledWith(
        'France',
      );
    });
  });

  describe('findOne()', () => {
    it('should return the city when found', async () => {
      repo.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
      const result = await service.findOne(1);
      expect(result).toEqual({ idCity: 1, name: 'Paris' });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('autofill()', () => {
    afterEach(() => jest.clearAllMocks());

    it('should throw NotFoundException when the geocoder finds nothing', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } } as never);
      await expect(service.autofill('Nowhereville')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should pick the result matching countryName and fetch the wiki image', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            results: [
              { name: 'Springfield', latitude: 1, longitude: 2, country: 'USA' },
              {
                name: 'Springfield',
                latitude: 10,
                longitude: 20,
                population: 500,
                timezone: 'Europe/Paris',
                country: 'France',
                feature_code: 'PPLC',
              },
            ],
          },
        } as never)
        .mockResolvedValueOnce({
          data: {
            query: {
              pages: { '1': { thumbnail: { source: 'https://img/pic.jpg' } } },
            },
          },
        } as never);

      const result = await service.autofill('Springfield', 'France');

      expect(result).toEqual({
        latitude: 10,
        longitude: 20,
        population: 500,
        timezone: 'Europe/Paris',
        isCapital: true,
        imageUrl: 'https://img/pic.jpg',
        matchedName: 'Springfield',
      });
    });

    it('should fall back to the first result when no country match, and tolerate a wiki failure', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            results: [
              { name: 'Lyon', latitude: 45, longitude: 4, country: 'France' },
            ],
          },
        } as never)
        .mockRejectedValueOnce(new Error('wiki down'));

      const result = await service.autofill('Lyon', 'Wonderland');

      expect(result.matchedName).toBe('Lyon');
      expect(result.imageUrl).toBeNull();
      expect(result.isCapital).toBe(false);
    });
  });

  describe('create()', () => {
    afterEach(() => jest.clearAllMocks());

    it('should reject self-assignment before touching the repo', async () => {
      await expect(
        service.create(
          { name: 'Paris', countryId: 1, assignedToId: 7 } as any,
          7,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(repo.find).not.toHaveBeenCalled();
    });

    it('should reject a duplicate city name for the same country', async () => {
      repo.find.mockResolvedValue([{ idCity: 1, name: 'Paris' }]);
      await expect(
        service.create({ name: 'paris', countryId: 1 } as any, 5),
      ).rejects.toThrow(ConflictException);
    });

    it('should create with provided fields, skip autofill, and notify admins when unassigned', async () => {
      repo.find.mockResolvedValue([]);
      repo.save.mockImplementation(async (c: any) => ({ ...c, idCity: 1 }));

      const saved = await service.create(
        {
          name: 'Paris',
          countryId: 1,
          latitude: 48.8,
          longitude: 2.3,
          population: 1000,
          timezone: 'Europe/Paris',
          imageUrl: 'https://img',
        } as any,
        5,
      );

      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(saved.status).toBe('pending_review');
      expect(review.notifyAdminsOfPending).toHaveBeenCalledWith(
        'Ville « Paris »',
        5,
      );
      expect(review.notifyUser).not.toHaveBeenCalled();
    });

    it('should autofill missing fields and notify the assignee when assigned', async () => {
      repo.find.mockResolvedValue([]);
      repo.manager.findOne.mockResolvedValue({
        idCountry: 1,
        countryName: 'France',
      });
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            results: [
              {
                name: 'Nice',
                latitude: 43.7,
                longitude: 7.2,
                population: 340000,
                timezone: 'Europe/Paris',
                country: 'France',
              },
            ],
          },
        } as never)
        .mockResolvedValueOnce({ data: {} } as never);
      repo.save.mockImplementation(async (c: any) => ({ ...c, idCity: 2 }));

      const saved = await service.create(
        { name: 'Nice', countryId: 1, assignedToId: 9 } as any,
        5,
      );

      expect(saved.latitude).toBe('43.7');
      expect(saved.population).toBe(340000);
      expect(review.notifyUser).toHaveBeenCalledWith(
        9,
        expect.stringContaining('Nice'),
        'alert',
      );
      expect(review.notifyAdminsOfPending).not.toHaveBeenCalled();
    });

    it('should not fail creation when autofill throws', async () => {
      repo.find.mockResolvedValue([]);
      repo.manager.findOne.mockResolvedValue(null);
      mockedAxios.get.mockRejectedValueOnce(new Error('geocoder down'));
      repo.save.mockImplementation(async (c: any) => ({ ...c, idCity: 3 }));

      const saved = await service.create(
        { name: 'Lille', countryId: 1 } as any,
        5,
      );

      expect(saved.status).toBe('pending_review');
    });
  });

  describe('markReviewDone()', () => {
    it('should mark review done and notify the creator', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        name: 'Paris',
        status: 'pending_review',
        assignedToId: 9,
        createdById: 5,
      });
      repo.save.mockImplementation(async (c: any) => c);

      const result = await service.markReviewDone(1, 9);

      expect(result.status).toBe('review_done');
      expect(result.reviewedById).toBe(9);
      expect(review.notifyUser).toHaveBeenCalledWith(
        5,
        expect.stringContaining('vérifiée'),
        'alert',
      );
    });

    it('should reject when the city is not pending_review', async () => {
      repo.findOne.mockResolvedValue({ idCity: 1, status: 'active' });
      await expect(service.markReviewDone(1, 9)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject when the city has no assignee', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        status: 'pending_review',
        assignedToId: null,
      });
      await expect(service.markReviewDone(1, 9)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject when called by a non-assignee', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        status: 'pending_review',
        assignedToId: 9,
      });
      await expect(service.markReviewDone(1, 3)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject when the assignee is also the author', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        status: 'pending_review',
        assignedToId: 9,
        createdById: 9,
      });
      await expect(service.markReviewDone(1, 9)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reviewCity()', () => {
    describe('assigned flow', () => {
      it('should reject final validation by the reviewer who did the check', async () => {
        repo.findOne.mockResolvedValue({
          idCity: 1,
          status: 'review_done',
          assignedToId: 9,
          reviewedById: 3,
        });
        await expect(service.reviewCity(1, 3, true)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should reject final validation by the assignee themselves', async () => {
        repo.findOne.mockResolvedValue({
          idCity: 1,
          status: 'review_done',
          assignedToId: 9,
          reviewedById: null,
        });
        await expect(service.reviewCity(1, 9, true)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should reject when the assigned check is not done yet', async () => {
        repo.findOne.mockResolvedValue({
          idCity: 1,
          status: 'pending_review',
          assignedToId: 9,
          reviewedById: null,
        });
        await expect(service.reviewCity(1, 5, true)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should publish and notify both assignee and author on approval', async () => {
        repo.findOne.mockResolvedValue({
          idCity: 1,
          name: 'Nice',
          status: 'review_done',
          assignedToId: 9,
          reviewedById: 9,
          createdById: 5,
        });
        repo.save.mockImplementation(async (c: any) => c);

        const result = await service.reviewCity(1, 5, true);

        expect(result.status).toBe('active');
        expect(review.notifyUser).toHaveBeenCalledWith(
          9,
          expect.stringContaining('publiée'),
          'info',
        );
        expect(review.notifyUser).toHaveBeenCalledWith(
          5,
          expect.stringContaining('publiée'),
          'info',
        );
      });

      it('should send the city back to the assignee on rejection, without double-notifying the author', async () => {
        repo.findOne.mockResolvedValue({
          idCity: 1,
          name: 'Nice',
          status: 'review_done',
          assignedToId: 9,
          reviewedById: 9,
          createdById: 9,
        });
        repo.save.mockImplementation(async (c: any) => c);

        const result = await service.reviewCity(1, 5, false);

        expect(result.status).toBe('pending_review');
        expect(review.notifyUser).toHaveBeenCalledTimes(1);
        expect(review.notifyUser).toHaveBeenCalledWith(
          9,
          expect.stringContaining('renvoyée'),
          'alert',
        );
      });
    });

    describe('legacy 4-eyes flow', () => {
      it('should reject when the city is not pending_review', async () => {
        repo.findOne.mockResolvedValue({
          idCity: 1,
          status: 'active',
          assignedToId: null,
        });
        await expect(service.reviewCity(1, 5, true)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should approve, set status active and notify the author', async () => {
        repo.findOne.mockResolvedValue({
          idCity: 1,
          name: 'Lille',
          status: 'pending_review',
          assignedToId: null,
          createdById: 5,
        });
        repo.save.mockImplementation(async (c: any) => c);

        const result = await service.reviewCity(1, 8, true);

        expect(result.status).toBe('active');
        expect(review.assertNotSelfReview).toHaveBeenCalledWith(5, 8);
        expect(review.notifyAuthorOfDecision).toHaveBeenCalledWith(
          'Ville « Lille »',
          5,
          true,
          8,
        );
      });

      it('should reject and set status rejected', async () => {
        repo.findOne.mockResolvedValue({
          idCity: 1,
          name: 'Lille',
          status: 'pending_review',
          assignedToId: null,
          createdById: 5,
        });
        repo.save.mockImplementation(async (c: any) => c);

        const result = await service.reviewCity(1, 8, false);

        expect(result.status).toBe('rejected');
      });
    });
  });

  describe('update()', () => {
    it('should reject changing status while pending_review', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        status: 'pending_review',
        name: 'Paris',
        countryId: 1,
      });
      await expect(
        service.update(1, { status: 'active' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject changing status while review_done', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        status: 'review_done',
        name: 'Paris',
        countryId: 1,
      });
      await expect(
        service.update(1, { status: 'active' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject an invalid status value on an already-decided city', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        status: 'active',
        name: 'Paris',
        countryId: 1,
      });
      await expect(
        service.update(1, { status: 'rejected' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow archiving an already-active city', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        status: 'active',
        name: 'Paris',
        countryId: 1,
      });
      repo.find.mockResolvedValue([]);
      repo.save.mockImplementation(async (c: any) => c);

      const result = await service.update(1, { status: 'archived' } as any);

      expect(result.status).toBe('archived');
    });

    it('should reject renaming to a name already used by another city in the country', async () => {
      repo.findOne.mockResolvedValue({
        idCity: 1,
        status: 'active',
        name: 'Paris',
        countryId: 1,
      });
      repo.find.mockResolvedValue([{ idCity: 2, name: 'Lyon' }]);

      await expect(
        service.update(1, { name: 'lyon' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });
});
