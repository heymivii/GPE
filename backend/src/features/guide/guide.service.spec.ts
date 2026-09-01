import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GuideService } from './guide.service';
import { Guide } from './entities/guide.entity';

const mockRepo = () => ({
  create: jest.fn((x) => x),
  save: jest.fn(async (x) => x),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(async (x) => x),
});

describe('GuideService', () => {
  let service: GuideService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuideService,
        {
          provide: getRepositoryToken(Guide),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<GuideService>(GuideService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should nest countryId into a country relation and save', async () => {
      const dto = { title: 'Visa guide', countryId: 3 } as any;

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        title: 'Visa guide',
        countryId: 3,
        country: { idCountry: 3 },
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({ title: 'Visa guide', countryId: 3 }),
      );
    });
  });

  describe('findAll()', () => {
    it('should return all guides with country relation', async () => {
      repo.find.mockResolvedValue([{ idGuide: 1 }, { idGuide: 2 }]);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({ relations: ['country'] });
      expect(result).toHaveLength(2);
    });
  });

  describe('findByCountry()', () => {
    it('should filter guides by countryId with country relation', async () => {
      repo.find.mockResolvedValue([{ idGuide: 1, countryId: 5 }]);

      const result = await service.findByCountry(5);

      expect(repo.find).toHaveBeenCalledWith({
        where: { country: { idCountry: 5 } },
        relations: ['country'],
      });
      expect(result).toEqual([{ idGuide: 1, countryId: 5 }]);
    });
  });

  describe('findOne()', () => {
    it('should return the guide when found', async () => {
      repo.findOne.mockResolvedValue({ idGuide: 1, title: 'Visa guide' });

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { idGuide: 1 },
        relations: ['country'],
      });
      expect(result).toEqual({ idGuide: 1, title: 'Visa guide' });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should merge the update dto onto the existing guide and save it', async () => {
      repo.findOne.mockResolvedValue({ idGuide: 1, title: 'Old title' });

      const result = await service.update(1, { title: 'New title' } as any);

      expect(result).toEqual({ idGuide: 1, title: 'New title' });
      expect(repo.save).toHaveBeenCalledWith({ idGuide: 1, title: 'New title' });
    });

    it('should propagate NotFoundException when the guide does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { title: 'New title' } as any),
      ).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should remove an existing guide', async () => {
      const guide = { idGuide: 1, title: 'Visa guide' };
      repo.findOne.mockResolvedValue(guide);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(guide);
    });

    it('should propagate NotFoundException when the guide does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
