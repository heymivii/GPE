import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CountryContentService } from './country-content.service';
import { CountryContent } from './entities/country-content.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('CountryContentService', () => {
  let service: CountryContentService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryContentService,
        { provide: getRepositoryToken(CountryContent), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<CountryContentService>(CountryContentService);
    repo = module.get(getRepositoryToken(CountryContent));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('wraps countryId into a country relation', async () => {
      const dto = { countryId: 3, title: 'x' } as any;
      repo.create.mockImplementation((c: any) => c);
      repo.save.mockImplementation((c: any) => Promise.resolve(c));
      const result = await service.create(dto);
      expect(result.country).toEqual({ idCountry: 3 });
    });
  });

  describe('findAll', () => {
    it('returns all contents with country relation', async () => {
      repo.find.mockResolvedValue([{ idCountryContent: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith({ relations: ['country'] });
    });
  });

  describe('findByCountry', () => {
    it('filters by country id', async () => {
      repo.find.mockResolvedValue([]);
      await service.findByCountry(3);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { country: { idCountry: 3 } } }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('returns the content when found', async () => {
      const content = { idCountryContent: 1 };
      repo.findOne.mockResolvedValue(content);
      const result = await service.findOne(1);
      expect(result).toEqual(content);
    });
  });

  describe('update', () => {
    it('merges the dto into the existing content', async () => {
      const content = { idCountryContent: 1, title: 'old' };
      repo.findOne.mockResolvedValue(content);
      repo.save.mockImplementation((c: any) => Promise.resolve(c));
      const result = await service.update(1, { title: 'new' } as any);
      expect(result.title).toBe('new');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('removes the content when found', async () => {
      const content = { idCountryContent: 1 };
      repo.findOne.mockResolvedValue(content);
      repo.remove.mockResolvedValue(undefined);
      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(content);
    });
  });
});
