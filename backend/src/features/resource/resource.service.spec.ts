import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { Resource } from './entities/resource.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((x) => x),
  save: jest.fn(async (x) => x),
  remove: jest.fn(async (x) => x),
});

describe('ResourceService', () => {
  let service: ResourceService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        {
          provide: getRepositoryToken(Resource),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should attach the country relation from countryId and save', async () => {
      const dto = { title: 'Visa guide', countryId: 5 } as any;

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith({
        title: 'Visa guide',
        countryId: 5,
        country: { idCountry: 5 },
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toMatchObject({ title: 'Visa guide' });
    });
  });

  describe('findAll()', () => {
    it('should return all resources with the country relation', async () => {
      repo.find.mockResolvedValue([{ idResource: 1 }, { idResource: 2 }]);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({ relations: ['country'] });
      expect(result).toHaveLength(2);
    });
  });

  describe('findByCountry()', () => {
    it('should filter by countryId and include the country relation', async () => {
      repo.find.mockResolvedValue([{ idResource: 3, countryId: 10 }]);

      const result = await service.findByCountry(10);

      expect(repo.find).toHaveBeenCalledWith({
        where: { country: { idCountry: 10 } },
        relations: ['country'],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne()', () => {
    it('should return the resource when found', async () => {
      repo.findOne.mockResolvedValue({ idResource: 1, title: 'Guide' });

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { idResource: 1 },
        relations: ['country'],
      });
      expect(result).toEqual({ idResource: 1, title: 'Guide' });
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should merge the dto onto the existing resource and save it', async () => {
      repo.findOne.mockResolvedValue({ idResource: 1, title: 'Old title' });

      const result = await service.update(1, { title: 'New title' } as any);

      expect(result).toEqual({ idResource: 1, title: 'New title' });
      expect(repo.save).toHaveBeenCalledWith({
        idResource: 1,
        title: 'New title',
      });
    });

    it('should throw NotFoundException when the resource does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { title: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should remove the resource when found', async () => {
      const resource = { idResource: 1, title: 'Guide' };
      repo.findOne.mockResolvedValue(resource);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(resource);
    });

    it('should throw NotFoundException when the resource does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
