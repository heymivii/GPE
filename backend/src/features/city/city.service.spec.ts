import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { City } from './entities/city.entity';
import { ReviewService } from '../review/review.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  manager: {
    transaction: jest.fn(),
  },
});

const mockReviewService = () => ({
  notifyAdminsOfPending: jest.fn(),
  notifyAuthorOfDecision: jest.fn(),
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
});
