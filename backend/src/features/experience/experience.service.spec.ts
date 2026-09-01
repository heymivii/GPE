import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { Experience } from './entities/experience.entity';

const mockRepo = () => ({
  create: jest.fn((x) => x),
  save: jest.fn(async (x) => x),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('ExperienceService', () => {
  let service: ExperienceService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperienceService,
        {
          provide: getRepositoryToken(Experience),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<ExperienceService>(ExperienceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should build the experience with user and country relations and save it', async () => {
      const dto = { title: 'Expat in Tokyo', countryId: 3 } as any;
      const result = await service.create(7, dto);

      expect(repo.create).toHaveBeenCalledWith({
        title: 'Expat in Tokyo',
        countryId: 3,
        user: { idUser: 7 },
        country: { idCountry: 3 },
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toMatchObject({ title: 'Expat in Tokyo' });
    });
  });

  describe('findAll()', () => {
    it('should return all experiences with user and country relations', async () => {
      repo.find.mockResolvedValue([{ idExperience: 1 }]);
      const result = await service.findAll();
      expect(result).toEqual([{ idExperience: 1 }]);
      expect(repo.find).toHaveBeenCalledWith({
        relations: ['user', 'country'],
      });
    });
  });

  describe('findByCountry()', () => {
    it('should filter experiences by country id', async () => {
      repo.find.mockResolvedValue([{ idExperience: 2 }]);
      const result = await service.findByCountry(5);
      expect(result).toEqual([{ idExperience: 2 }]);
      expect(repo.find).toHaveBeenCalledWith({
        where: { country: { idCountry: 5 } },
        relations: ['user', 'country'],
      });
    });
  });

  describe('findOne()', () => {
    it('should return the experience when found', async () => {
      repo.findOne.mockResolvedValue({ idExperience: 1, title: 'Test' });
      const result = await service.findOne(1);
      expect(result).toEqual({ idExperience: 1, title: 'Test' });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should merge the dto onto the found experience and save it', async () => {
      repo.findOne.mockResolvedValue({ idExperience: 1, title: 'Old' });
      const result = await service.update(1, { title: 'New' } as any);
      expect(result).toEqual({ idExperience: 1, title: 'New' });
      expect(repo.save).toHaveBeenCalledWith({ idExperience: 1, title: 'New' });
    });

    it('should propagate NotFoundException when the experience does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.update(999, { title: 'New' } as any),
      ).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should remove the found experience', async () => {
      const experience = { idExperience: 1 };
      repo.findOne.mockResolvedValue(experience);
      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(experience);
    });

    it('should propagate NotFoundException when the experience does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
