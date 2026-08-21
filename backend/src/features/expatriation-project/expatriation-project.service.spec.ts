import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExpatriationProjectService } from './expatriation-project.service';
import { ExpatriationProject } from './entities/expatriation-project.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('ExpatriationProjectService', () => {
  let service: ExpatriationProjectService;
  let projectRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpatriationProjectService,
        { provide: getRepositoryToken(ExpatriationProject), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<ExpatriationProjectService>(ExpatriationProjectService);
    projectRepo = module.get(getRepositoryToken(ExpatriationProject));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and returns a project for the user', async () => {
      const project = { idProject: 1, userId: 1, idDestinationCountry: 3 };
      projectRepo.create.mockReturnValue(project);
      projectRepo.save.mockResolvedValue(project);
      const result = await service.create(1, { idDestinationCountry: 3 } as any);
      expect(result.userId).toBe(1);
      expect(projectRepo.save).toHaveBeenCalled();
    });

    it('assigns userId from parameter not from dto', async () => {
      const project = { idProject: 1, userId: 42 };
      projectRepo.create.mockReturnValue(project);
      projectRepo.save.mockResolvedValue(project);
      await service.create(42, { idDestinationCountry: 3 } as any);
      expect(projectRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 42 }),
      );
    });
  });

  describe('findAllByUser', () => {
    it('returns all projects for a user', async () => {
      projectRepo.find.mockResolvedValue([{ idProject: 1 }, { idProject: 2 }]);
      const result = await service.findAllByUser(1);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when user has no projects', async () => {
      projectRepo.find.mockResolvedValue([]);
      const result = await service.findAllByUser(1);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when project does not exist', async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when project belongs to another user', async () => {
      projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 2 });
      await expect(service.findOne(1, 99)).rejects.toThrow(ForbiddenException);
    });

    it('returns project when owner requests it', async () => {
      const project = { idProject: 1, userId: 1 };
      projectRepo.findOne.mockResolvedValue(project);
      const result = await service.findOne(1, 1);
      expect(result.idProject).toBe(1);
    });
  });

  describe('remove', () => {
    it('throws ForbiddenException when project belongs to another user', async () => {
      projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 2 });
      await expect(service.remove(1, 99)).rejects.toThrow(ForbiddenException);
    });

    it('removes project when owner requests it', async () => {
      const project = { idProject: 1, userId: 1 };
      projectRepo.findOne.mockResolvedValue(project);
      projectRepo.remove.mockResolvedValue(undefined);
      await service.remove(1, 1);
      expect(projectRepo.remove).toHaveBeenCalledWith(project);
    });
  });
});
