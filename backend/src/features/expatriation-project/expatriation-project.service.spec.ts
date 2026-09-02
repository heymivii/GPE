import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ExpatriationProjectService } from './expatriation-project.service';
import { ExpatriationProject } from './entities/expatriation-project.entity';
import { ProcedureTracking } from '../procedure-tracking/entities/procedure-tracking.entity';
import { User } from '../user/entities/user.entity';

const mockQueryBuilder = () => ({
  delete: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(undefined),
});

const mockRepo = () => {
  const queryBuilder = mockQueryBuilder();
  const entityManager = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    manager: {
      transaction: jest.fn((cb: any) => cb(entityManager)),
      entityManager,
      queryBuilder,
    },
  };
};

describe('ExpatriationProjectService', () => {
  let service: ExpatriationProjectService;
  let projectRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpatriationProjectService,
        {
          provide: getRepositoryToken(ExpatriationProject),
          useFactory: mockRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();
    service = module.get<ExpatriationProjectService>(
      ExpatriationProjectService,
    );
    projectRepo = module.get(getRepositoryToken(ExpatriationProject));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and returns a project for the user', async () => {
      const project = { idProject: 1, userId: 1, idDestinationCountry: 3 };
      projectRepo.create.mockReturnValue(project);
      projectRepo.save.mockResolvedValue(project);
      const result = await service.create(1, {
        idDestinationCountry: 3,
      } as any);
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
      await service.remove(1, 1);
      expect(projectRepo.manager.transaction).toHaveBeenCalled();
      expect(projectRepo.manager.queryBuilder.from).toHaveBeenCalledWith(
        ProcedureTracking,
      );
      expect(projectRepo.manager.queryBuilder.where).toHaveBeenCalledWith(
        'project_id = :projectId',
        { projectId: 1 },
      );
      expect(projectRepo.manager.entityManager.delete).toHaveBeenCalledWith(
        ExpatriationProject,
        1,
      );
    });
  });

  describe('update', () => {
    it('throws ForbiddenException when project belongs to another user', async () => {
      projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 2 });
      await expect(
        service.update(1, 99, { isPaid: true } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('merges the dto into the project and saves it', async () => {
      const project = { idProject: 1, userId: 1, isPaid: false };
      projectRepo.findOne.mockResolvedValue(project);
      projectRepo.save.mockImplementation(async (p: any) => p);

      const result = await service.update(1, 1, { isPaid: true } as any);

      expect(result.isPaid).toBe(true);
      expect(projectRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isPaid: true }),
      );
    });
  });

  /* ===== PRICING DÉSACTIVÉ — service.unlock commenté, tests avec =====
  describe('unlock', () => {
    it('throws ForbiddenException when project belongs to another user', async () => {
      projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 2 });
      await expect(service.unlock(1, 99)).rejects.toThrow(ForbiddenException);
    });

    it('marks the project as paid and saves it', async () => {
      const project = { idProject: 1, userId: 1, isPaid: false };
      projectRepo.findOne.mockResolvedValue(project);
      projectRepo.save.mockImplementation(async (p: any) => p);

      const result = await service.unlock(1, 1);

      expect(result.isPaid).toBe(true);
      expect(projectRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isPaid: true }),
      );
    });
  });
  ===== FIN PRICING DÉSACTIVÉ ===== */

  describe('countByUser', () => {
    it('returns the count of projects for the user', async () => {
      projectRepo.count = jest.fn().mockResolvedValue(3);
      const result = await service.countByUser(1);
      expect(result).toBe(3);
      expect(projectRepo.count).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe('findAll (admin)', () => {
    it('returns all projects ordered by idProject DESC', async () => {
      projectRepo.find.mockResolvedValue([{ idProject: 2 }, { idProject: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(projectRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { idProject: 'DESC' } }),
      );
    });
  });

  describe('adminUpdate', () => {
    it('throws NotFoundException when project does not exist', async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(
        service.adminUpdate(999, { isPaid: true } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('merges the dto into the project and saves it without an owner check', async () => {
      const project = { idProject: 1, userId: 2, isPaid: false };
      projectRepo.findOne.mockResolvedValue(project);
      projectRepo.save.mockImplementation(async (p: any) => p);

      const result = await service.adminUpdate(1, { isPaid: true } as any);

      expect(result.isPaid).toBe(true);
    });
  });
});

const FRANCE = 1;
const CANADA = 2;

describe('ExpatriationProjectService — destination ≠ pays de départ', () => {
  let service: ExpatriationProjectService;
  let projectRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let userRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    projectRepo = {
      create: jest.fn((v) => v),
      save: jest.fn((v) => Promise.resolve({ idProject: 10, ...v })),
      findOne: jest.fn(),
    };
    userRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpatriationProjectService,
        { provide: getRepositoryToken(ExpatriationProject), useValue: projectRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<ExpatriationProjectService>(ExpatriationProjectService);
  });

  describe('create', () => {
    it('refuse un projet dont la destination est le pays de départ du profil', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: FRANCE });

      await expect(
        service.create(3, { destinationCountryId: FRANCE }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(projectRepo.save).not.toHaveBeenCalled();
    });

    it('accepte une destination différente du pays de départ', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: FRANCE });

      await expect(
        service.create(3, { destinationCountryId: CANADA }),
      ).resolves.toEqual(expect.objectContaining({ destinationCountryId: CANADA }));
    });

    it('laisse passer un profil sans pays de départ renseigné', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: null });

      await expect(
        service.create(3, { destinationCountryId: FRANCE }),
      ).resolves.toEqual(expect.objectContaining({ destinationCountryId: FRANCE }));
    });
  });

  describe('update', () => {
    beforeEach(() => {
      projectRepo.findOne.mockResolvedValue({
        idProject: 10,
        userId: 3,
        destinationCountryId: CANADA,
      });
    });

    it('refuse de basculer la destination sur le pays de départ', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: FRANCE });

      await expect(
        service.update(10, 3, { destinationCountryId: FRANCE }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(projectRepo.save).not.toHaveBeenCalled();
    });

    it('ne bloque pas une mise à jour qui ne touche pas la destination', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: FRANCE });

      await expect(service.update(10, 3, { budget: 1200 })).resolves.toEqual(
        expect.objectContaining({ budget: 1200 }),
      );
      expect(userRepo.findOne).not.toHaveBeenCalled();
    });
  });
});
