import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { Checklist } from './entities/checklist.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('ChecklistService', () => {
  let service: ChecklistService;
  let checklistRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistService,
        { provide: getRepositoryToken(Checklist), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<ChecklistService>(ChecklistService);
    checklistRepo = module.get(getRepositoryToken(Checklist));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and saves a checklist', async () => {
      const checklist = { idChecklist: 1, title: 'Visa USA' };
      checklistRepo.create.mockReturnValue(checklist);
      checklistRepo.save.mockResolvedValue(checklist);
      const result = await service.create({ title: 'Visa USA', steps: [], countryId: 3 });
      expect(result.title).toBe('Visa USA');
      expect(checklistRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all checklists', async () => {
      checklistRepo.find.mockResolvedValue([{ idChecklist: 1 }, { idChecklist: 2 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no checklists', async () => {
      checklistRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findByCountry', () => {
    it('returns checklists for a given country', async () => {
      checklistRepo.find.mockResolvedValue([{ idChecklist: 1, country: { idCountry: 3 } }]);
      const result = await service.findByCountry(3);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when checklist not found', async () => {
      checklistRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('returns checklist when found', async () => {
      checklistRepo.findOne.mockResolvedValue({ idChecklist: 1, title: 'Visa USA' });
      const result = await service.findOne(1);
      expect(result.idChecklist).toBe(1);
    });
  });

  describe('update', () => {
    it('updates and saves checklist', async () => {
      const checklist = { idChecklist: 1, title: 'Old title' };
      checklistRepo.findOne.mockResolvedValue(checklist);
      checklistRepo.save.mockResolvedValue({ ...checklist, title: 'New title' });
      const result = await service.update(1, { title: 'New title' });
      expect(result.title).toBe('New title');
    });
  });

  describe('remove', () => {
    it('removes checklist when found', async () => {
      const checklist = { idChecklist: 1 };
      checklistRepo.findOne.mockResolvedValue(checklist);
      checklistRepo.remove.mockResolvedValue(undefined);
      await service.remove(1);
      expect(checklistRepo.remove).toHaveBeenCalledWith(checklist);
    });

    it('throws NotFoundException when checklist not found', async () => {
      checklistRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
