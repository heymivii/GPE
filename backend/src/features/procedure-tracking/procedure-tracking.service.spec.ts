import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { ProcedureTracking } from './entities/procedure-tracking.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';

// Helper: build a minimal AdminProcedure stub
function makeAP(
  id: number,
  category: string,
  objectives: string[] | null = null,
  status = 'active',
): Partial<AdminProcedure> {
  return {
    idAdminProcedure: id,
    category,
    objectives: objectives ?? undefined,
    stepOrder: id,
    status,
  };
}

describe('ProcedureTrackingService', () => {
  let service: ProcedureTrackingService;

  let trackingRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let projectRepo: { findOne: jest.Mock };
  let adminProcedureRepo: { find: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    trackingRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    projectRepo = { findOne: jest.fn() };
    adminProcedureRepo = { find: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcedureTrackingService,
        {
          provide: getRepositoryToken(ProcedureTracking),
          useValue: trackingRepo,
        },
        {
          provide: getRepositoryToken(ExpatriationProject),
          useValue: projectRepo,
        },
        {
          provide: getRepositoryToken(AdminProcedure),
          useValue: adminProcedureRepo,
        },
      ],
    }).compile();

    service = module.get<ProcedureTrackingService>(ProcedureTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUser – objective filter', () => {
    const userId = 1;
    const projectId = 10;

    function setupProject(objective: string | null) {
      projectRepo.findOne.mockResolvedValue({
        idProject: projectId,
        userId,
        destinationCountryId: 5,
        objective,
      });
    }

    function setupTrackingFindAll(procedures: Partial<AdminProcedure>[]) {
      // Return existing trackings (empty → forces seeding)
      trackingRepo.find.mockResolvedValueOnce([]); // existingTrackings
      trackingRepo.create.mockImplementation((data) => ({ ...data }));
      trackingRepo.save.mockResolvedValue(undefined);
      // Final allTrackings: wrap each procedure in a tracking
      trackingRepo.find.mockResolvedValueOnce(
        procedures.map((ap) => ({
          idProcedureTracking: ap.idAdminProcedure,
          admin_procedure: ap,
          status: 'not_started',
        })),
      );
    }

    it('includes procedures with empty objectives for any project objective', async () => {
      const apVisa = makeAP(1, 'visa', []);
      setupProject('work');
      adminProcedureRepo.find.mockResolvedValue([apVisa]);
      setupTrackingFindAll([apVisa]);

      const result = await service.findAllByUser(userId, projectId);
      expect(result).toHaveLength(1);
      expect(result[0].admin_procedure?.category).toBe('visa');
    });

    it('includes procedures with null objectives for any project objective', async () => {
      const apVisa = makeAP(1, 'visa', null);
      setupProject('study');
      adminProcedureRepo.find.mockResolvedValue([apVisa]);
      setupTrackingFindAll([apVisa]);

      const result = await service.findAllByUser(userId, projectId);
      expect(result).toHaveLength(1);
    });

    it('keeps emploi procedure for "work" objective', async () => {
      const apEmploi = makeAP(2, 'emploi', ['work']);
      setupProject('work');
      adminProcedureRepo.find.mockResolvedValue([apEmploi]);
      setupTrackingFindAll([apEmploi]);

      const result = await service.findAllByUser(userId, projectId);
      expect(result).toHaveLength(1);
      expect(result[0].admin_procedure?.category).toBe('emploi');
    });

    it('excludes emploi procedure for "study" objective', async () => {
      const apVisa = makeAP(1, 'visa', []);
      const apEmploi = makeAP(2, 'emploi', ['work']);
      setupProject('study');
      adminProcedureRepo.find.mockResolvedValue([apVisa, apEmploi]);
      // Only visa should pass the filter → setupTrackingFindAll receives only apVisa
      setupTrackingFindAll([apVisa]);

      const result = await service.findAllByUser(userId, projectId);
      const categories = result.map((r) => r.admin_procedure?.category);
      expect(categories).toContain('visa');
      expect(categories).not.toContain('emploi');
    });

    it('includes all procedures when project objective is null', async () => {
      const apVisa = makeAP(1, 'visa', []);
      const apEmploi = makeAP(2, 'emploi', ['work']);
      setupProject(null);
      adminProcedureRepo.find.mockResolvedValue([apVisa, apEmploi]);
      setupTrackingFindAll([apVisa, apEmploi]);

      const result = await service.findAllByUser(userId, projectId);
      expect(result).toHaveLength(2);
    });

    it('throws NotFoundException when project not found', async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(service.findAllByUser(userId, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update – completedFacts', () => {
    const trackingId = 42;

    function stubFindOne(extra: Partial<Record<string, unknown>> = {}) {
      const tracking = {
        idProcedureTracking: trackingId,
        status: 'not_started',
        completedFacts: [] as number[],
        end_date: null as string | null,
        user: { idUser: 1 },
        admin_procedure: { idAdminProcedure: 1 },
        project: { idProject: 10 },
        ...extra,
      };
      // findOne is called inside service.findOne → trackingRepository.findOne
      trackingRepo.findOne.mockResolvedValue(tracking);
      trackingRepo.save.mockImplementation(async (t: typeof tracking) => t);
      return tracking;
    }

    it('persists completedFacts as substep indices when provided', async () => {
      stubFindOne();

      const result = await service.update(trackingId, 1, {
        completedFacts: [0, 2],
      });

      expect(trackingRepo.save).toHaveBeenCalledTimes(1);
      expect(result.completedFacts).toEqual([0, 2]);
    });

    it('does not overwrite completedFacts when not provided in dto', async () => {
      stubFindOne({ completedFacts: [0] });

      const result = await service.update(trackingId, 1, {
        status: 'in_progress',
      });

      expect(result.completedFacts).toEqual([0]);
    });

    it('updates status alongside completedFacts in the same call', async () => {
      stubFindOne();

      const result = await service.update(trackingId, 1, {
        status: 'in_progress',
        completedFacts: [1],
      });

      expect(result.status).toBe('in_progress');
      expect(result.completedFacts).toEqual([1]);
    });
  });

  describe('findAllByUser – archived procedure filtering', () => {
    const userId = 1;
    const projectId = 10;

    function setupProjectWith(objective: string | null = null) {
      projectRepo.findOne.mockResolvedValue({
        idProject: projectId,
        userId,
        destinationCountryId: 5,
        objective,
      });
    }

    it('excludes archived procedures from the seeding pool', async () => {
      const activeVisa = makeAP(1, 'visa', [], 'active');
      const archivedSante = makeAP(2, 'sante', [], 'archived');

      setupProjectWith(null);
      adminProcedureRepo.find.mockResolvedValue([activeVisa, archivedSante]);

      // existingTrackings → empty (seed both)
      trackingRepo.find.mockResolvedValueOnce([]);
      trackingRepo.create.mockImplementation((d: any) => ({ ...d }));
      trackingRepo.save.mockResolvedValue(undefined);

      // Final allTrackings — include both trackings (as stored in DB)
      trackingRepo.find.mockResolvedValueOnce([
        {
          idProcedureTracking: 1,
          admin_procedure: activeVisa,
          status: 'not_started',
        },
        {
          idProcedureTracking: 2,
          admin_procedure: archivedSante,
          status: 'not_started',
        },
      ]);

      const result = await service.findAllByUser(userId, projectId);

      // Archived procedure is filtered from the result
      expect(result.map((r) => r.admin_procedure?.category)).not.toContain(
        'sante',
      );
      expect(result.map((r) => r.admin_procedure?.category)).toContain('visa');
    });

    it('returns only active procedure trackings (archived hidden from checklist)', async () => {
      const activeVisa = makeAP(1, 'visa', [], 'active');
      const archivedEmploi = makeAP(3, 'emploi', [], 'archived');

      setupProjectWith(null);
      adminProcedureRepo.find.mockResolvedValue([activeVisa]);

      trackingRepo.find.mockResolvedValueOnce([]); // no existing
      trackingRepo.create.mockImplementation((d: any) => ({ ...d }));
      trackingRepo.save.mockResolvedValue(undefined);

      // DB has both active and archived trackings
      trackingRepo.find.mockResolvedValueOnce([
        {
          idProcedureTracking: 1,
          admin_procedure: activeVisa,
          status: 'not_started',
        },
        {
          idProcedureTracking: 3,
          admin_procedure: archivedEmploi,
          status: 'in_progress',
        },
      ]);

      const result = await service.findAllByUser(userId, projectId);

      // Only active
      expect(result).toHaveLength(1);
      expect(result[0].admin_procedure?.category).toBe('visa');
    });

    it('does NOT seed new trackings for archived procedures', async () => {
      const archivedSante = makeAP(2, 'sante', [], 'archived');

      setupProjectWith(null);
      adminProcedureRepo.find.mockResolvedValue([archivedSante]);

      trackingRepo.find.mockResolvedValueOnce([]); // no existing
      trackingRepo.create.mockImplementation((d: any) => ({ ...d }));
      trackingRepo.save.mockResolvedValue(undefined);
      trackingRepo.find.mockResolvedValueOnce([]); // no trackings stored

      await service.findAllByUser(userId, projectId);

      // save should NOT have been called — archived procedure not seeded
      expect(trackingRepo.save).not.toHaveBeenCalled();
    });
  });
});
