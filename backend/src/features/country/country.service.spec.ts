import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';
import { ReviewService } from '../review/review.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockReview = () => ({
  notifyAdminsOfAddition: jest.fn(async () => undefined),
  notifyAdminsOfPending: jest.fn(async () => undefined),
  notifyAuthorOfDecision: jest.fn(async () => undefined),
  notifyUser: jest.fn(async () => undefined),
  nameOf: jest.fn(async () => 'Admin'),
  assertNotSelfReview: jest.fn(),
});

describe('CountryService', () => {
  let service: CountryService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        { provide: getRepositoryToken(Country), useValue: repo },
        { provide: ReviewService, useValue: mockReview() },
      ],
    }).compile();
    service = module.get<CountryService>(CountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create and save a country', async () => {
      const dto = { countryName: 'France' };
      repo.create.mockReturnValue({ idCountry: 1, ...dto });
      repo.save.mockResolvedValue({ idCountry: 1, ...dto });

      const result = await service.create(dto as any);
      expect(result.countryName).toBe('France');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('should return countries with continent relation (no status filter)', async () => {
      repo.find.mockResolvedValue([{ idCountry: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['continent', 'createdBy', 'reviewedBy'],
        }),
      );
      // No where.status when no arg passed
      const callArg = repo.find.mock.calls[0][0];
      expect(callArg.where).toBeUndefined();
    });

    it('should filter by status when status arg is provided', async () => {
      repo.find.mockResolvedValue([{ idCountry: 2, status: 'active' }]);
      const result = await service.findAll('active');
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'active' } }),
      );
    });

    it('should not apply status filter when status is undefined', async () => {
      repo.find.mockResolvedValue([{ idCountry: 1 }, { idCountry: 2 }]);
      await service.findAll(undefined);
      const callArg = repo.find.mock.calls[0][0];
      expect(callArg.where).toBeUndefined();
    });
  });

  describe('findOne()', () => {
    it('should return a country', async () => {
      repo.findOne.mockResolvedValue({ idCountry: 1, countryName: 'France' });
      const result = await service.findOne(1);
      expect(result.countryName).toBe('France');
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update country fields', async () => {
      const country = { idCountry: 1, countryName: 'Old' };
      repo.findOne.mockResolvedValue(country);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.update(1, { countryName: 'New' } as any);
      expect(result.countryName).toBe('New');
    });
  });

  describe('remove()', () => {
    it('should remove a country', async () => {
      const country = { idCountry: 1 };
      repo.findOne.mockResolvedValue(country);
      repo.remove.mockResolvedValue(country);

      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(country);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
