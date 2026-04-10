import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ContinentService } from './continent.service';
import { Continent } from './entities/continent.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('ContinentService', () => {
  let service: ContinentService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContinentService,
        { provide: getRepositoryToken(Continent), useValue: repo },
      ],
    }).compile();
    service = module.get<ContinentService>(ContinentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create and save a continent', async () => {
      const dto = { name: 'Europe' };
      repo.create.mockReturnValue({ id: 1, ...dto });
      repo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any);
      expect(result.name).toBe('Europe');
    });
  });

  describe('findAll()', () => {
    it('should return all continents', async () => {
      repo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne()', () => {
    it('should return a continent', async () => {
      repo.findOne.mockResolvedValue({
        id: 1,
        name: 'Europe',
      });
      const result = await service.findOne(1);
      expect(result.name).toBe('Europe');
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update continent', async () => {
      const continent = { id: 1, name: 'Old' };
      repo.findOne.mockResolvedValue(continent);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.update(1, { name: 'New' } as any);
      expect(result.name).toBe('New');
    });
  });

  describe('remove()', () => {
    it('should remove continent', async () => {
      const continent = { id: 1 };
      repo.findOne.mockResolvedValue(continent);
      repo.remove.mockResolvedValue(continent);

      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(continent);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
