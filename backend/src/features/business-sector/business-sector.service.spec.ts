import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BusinessSectorService } from './business-sector.service';
import { BusinessSector } from './entities/business-sector.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('BusinessSectorService', () => {
  let service: BusinessSectorService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessSectorService,
        { provide: getRepositoryToken(BusinessSector), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<BusinessSectorService>(BusinessSectorService);
    repo = module.get(getRepositoryToken(BusinessSector));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and saves a new sector', async () => {
      const dto = { name: 'Tech' } as any;
      repo.create.mockReturnValue(dto);
      repo.save.mockResolvedValue({ idBusinessSector: 1, ...dto });
      const result = await service.create(dto);
      expect(result).toEqual({ idBusinessSector: 1, name: 'Tech' });
    });
  });

  describe('findAll', () => {
    it('returns all sectors', async () => {
      repo.find.mockResolvedValue([{ idBusinessSector: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the sector does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('returns the sector when found', async () => {
      const sector = { idBusinessSector: 1, name: 'Tech' };
      repo.findOne.mockResolvedValue(sector);
      const result = await service.findOne(1);
      expect(result).toEqual(sector);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the sector does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(999, { name: 'x' } as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('merges the dto into the existing sector', async () => {
      const sector = { idBusinessSector: 1, name: 'old' };
      repo.findOne.mockResolvedValue(sector);
      repo.save.mockImplementation((s: any) => Promise.resolve(s));
      const result = await service.update(1, { name: 'new' } as any);
      expect(result.name).toBe('new');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the sector does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('removes the sector when found', async () => {
      const sector = { idBusinessSector: 1 };
      repo.findOne.mockResolvedValue(sector);
      repo.remove.mockResolvedValue(undefined);
      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(sector);
    });
  });
});
