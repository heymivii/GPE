import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
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
      ],
    }).compile();
    service = module.get<CountryService>(CountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create and save a country', async () => {
      const dto = { name: 'France' };
      repo.create.mockReturnValue({ id: 1, ...dto });
      repo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any);
      expect(result.name).toBe('France');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('should return countries with continent relation', async () => {
      repo.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['continent'] }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return a country', async () => {
      repo.findOne.mockResolvedValue({ id: 1, name: 'France' });
      const result = await service.findOne(1);
      expect(result.name).toBe('France');
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update country fields', async () => {
      const country = { id: 1, name: 'Old' };
      repo.findOne.mockResolvedValue(country);
      repo.save.mockImplementation(async (c) => c);

      const result = await service.update(1, { name: 'New' } as any);
      expect(result.name).toBe('New');
    });
  });

  describe('remove()', () => {
    it('should remove a country', async () => {
      const country = { id: 1 };
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
