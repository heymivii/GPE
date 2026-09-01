import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CityComparisonService } from './city-comparison.service';
import { CityComparison } from './entities/city-comparison.entity';

const mockRepo = () => ({
  create: jest.fn((x) => x),
  save: jest.fn(async (x) => ({ idCityComparison: 1, ...x })),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('CityComparisonService', () => {
  let service: CityComparisonService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityComparisonService,
        {
          provide: getRepositoryToken(CityComparison),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<CityComparisonService>(CityComparisonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create and save a comparison for the given user and city', async () => {
      const result = await service.create(5, { cityId: 3 } as any);

      expect(repo.create).toHaveBeenCalledWith({
        user: { idUser: 5 },
        city: { idCity: 3 },
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          user: { idUser: 5 },
          city: { idCity: 3 },
        }),
      );
    });
  });

  describe('findAllByUser()', () => {
    it('should query comparisons scoped to the user with city relations', async () => {
      const rows = [{ idCityComparison: 1 }];
      repo.find.mockResolvedValue(rows);

      const result = await service.findAllByUser(7);

      expect(repo.find).toHaveBeenCalledWith({
        where: { user: { idUser: 7 } },
        relations: ['city', 'city.country'],
      });
      expect(result).toBe(rows);
    });
  });

  describe('findOne()', () => {
    it('should return the comparison when it belongs to the user', async () => {
      const comparison = { idCityComparison: 1, user: { idUser: 9 } };
      repo.findOne.mockResolvedValue(comparison);

      const result = await service.findOne(1, 9);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { idCityComparison: 1 },
        relations: ['city', 'city.country', 'user'],
      });
      expect(result).toBe(comparison);
    });

    it('should throw NotFoundException when the comparison does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99, 9)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the comparison belongs to another user', async () => {
      repo.findOne.mockResolvedValue({
        idCityComparison: 1,
        user: { idUser: 9 },
      });

      await expect(service.findOne(1, 42)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove()', () => {
    it('should remove the comparison after ownership check', async () => {
      const comparison = { idCityComparison: 1, user: { idUser: 9 } };
      repo.findOne.mockResolvedValue(comparison);

      await service.remove(1, 9);

      expect(repo.remove).toHaveBeenCalledWith(comparison);
    });

    it('should propagate ForbiddenException without calling remove', async () => {
      repo.findOne.mockResolvedValue({
        idCityComparison: 1,
        user: { idUser: 9 },
      });

      await expect(service.remove(1, 42)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
