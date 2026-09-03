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

  describe('create()', () => {
    it('should build the tracking with nested relations and save it', async () => {
      const dto = {
        status: 'in_progress',
        startDate: '2026-01-01',
        endDate: null,
        adminProcedureId: 3,
        expatProjectId: 10,
      } as any;
      trackingRepo.create.mockReturnValue({ ...dto });
      trackingRepo.save.mockResolvedValue({ idProcedureTracking: 1, ...dto });

      const result = await service.create(1, dto);

      expect(trackingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'in_progress',
          user: { idUser: 1 },
          admin_procedure: { idAdminProcedure: 3 },
          project: { idProject: 10 },
        }),
      );
      expect(result.idProcedureTracking).toBe(1);
    });

    it('should default status to not_started when omitted', async () => {
      const dto = { adminProcedureId: 3, expatProjectId: 10 } as any;
      trackingRepo.create.mockReturnValue({ ...dto });
      trackingRepo.save.mockResolvedValue({ idProcedureTracking: 1 });

      await service.create(1, dto);

      expect(trackingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'not_started' }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return the tracking when it belongs to the user', async () => {
      trackingRepo.findOne.mockResolvedValue({
        idProcedureTracking: 1,
        user: { idUser: 1 },
      });
      const result = await service.findOne(1, 1);
      expect(result.idProcedureTracking).toBe(1);
    });

    it('should throw NotFoundException when the tracking does not exist', async () => {
      trackingRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when the tracking belongs to another user', async () => {
      trackingRepo.findOne.mockResolvedValue({
        idProcedureTracking: 1,
        user: { idUser: 2 },
      });
      await expect(service.findOne(1, 1)).rejects.toThrow(
        'Accès refusé à ce suivi de procédure',
      );
    });
  });

  describe('remove()', () => {
    it('should find then remove the tracking', async () => {
      const tracking = { idProcedureTracking: 1, user: { idUser: 1 } };
      trackingRepo.findOne.mockResolvedValue(tracking);
      trackingRepo.remove.mockResolvedValue(tracking);

      await service.remove(1, 1);

      expect(trackingRepo.remove).toHaveBeenCalledWith(tracking);
    });
  });

  describe('update() – end_date auto-fill', () => {
    it('should set end_date to today when marked completed and none is set yet', async () => {
      trackingRepo.findOne.mockResolvedValue({
        idProcedureTracking: 1,
        status: 'in_progress',
        end_date: null,
        user: { idUser: 1 },
      });
      trackingRepo.save.mockImplementation(async (t: any) => t);

      const result = await service.update(1, 1, { status: 'completed' } as any);

      expect(result.end_date).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should not overwrite an existing end_date when re-marked completed', async () => {
      trackingRepo.findOne.mockResolvedValue({
        idProcedureTracking: 1,
        status: 'in_progress',
        end_date: '2026-01-01',
        user: { idUser: 1 },
      });
      trackingRepo.save.mockImplementation(async (t: any) => t);

      const result = await service.update(1, 1, { status: 'completed' } as any);

      expect(result.end_date).toBe('2026-01-01');
    });

    it('should clear end_date when reset to not_started', async () => {
      trackingRepo.findOne.mockResolvedValue({
        idProcedureTracking: 1,
        status: 'completed',
        end_date: '2026-01-01',
        user: { idUser: 1 },
      });
      trackingRepo.save.mockImplementation(async (t: any) => t);

      const result = await service.update(1, 1, {
        status: 'not_started',
      } as any);

      expect(result.end_date).toBeNull();
    });

    it('should clear end_date when set back to in_progress', async () => {
      trackingRepo.findOne.mockResolvedValue({
        idProcedureTracking: 1,
        status: 'completed',
        end_date: '2026-01-01',
        user: { idUser: 1 },
      });
      trackingRepo.save.mockImplementation(async (t: any) => t);

      const result = await service.update(1, 1, {
        status: 'in_progress',
      } as any);

      expect(result.end_date).toBeNull();
    });
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

    it('keeps only universal procedures when project objective is null (strict personalization)', async () => {
      const apVisa = makeAP(1, 'visa', []);
      const apEmploi = makeAP(2, 'emploi', ['work']);
      setupProject(null);
      adminProcedureRepo.find.mockResolvedValue([apVisa, apEmploi]);
      // Only the universal visa procedure passes the strict filter
      setupTrackingFindAll([apVisa]);

      const result = await service.findAllByUser(userId, projectId);
      const categories = result.map((r) => r.admin_procedure?.category);
      expect(categories).toEqual(['visa']);
    });

    it('hides an EXISTING tracking whose procedure no longer matches the project objective', async () => {
      // Ex. « Créer une entreprise » retargetée ['work'] : un projet study qui avait
      // déjà son tracking ne doit plus la voir, sans suppression de ligne.
      const apVisa = makeAP(1, 'visa', []);
      const apBusiness = makeAP(2, 'business', ['work']);
      setupProject('study');
      adminProcedureRepo.find.mockResolvedValue([apVisa, apBusiness]);
      trackingRepo.find.mockResolvedValueOnce([
        { idProcedureTracking: 1, admin_procedure: apVisa, status: 'not_started' },
        { idProcedureTracking: 2, admin_procedure: apBusiness, status: 'not_started' },
      ]); // existingTrackings — both already seeded
      trackingRepo.find.mockResolvedValueOnce([
        { idProcedureTracking: 1, admin_procedure: apVisa, status: 'not_started' },
        { idProcedureTracking: 2, admin_procedure: apBusiness, status: 'not_started' },
      ]); // allTrackings

      const result = await service.findAllByUser(userId, projectId);
      const categories = result.map((r) => r.admin_procedure?.category);
      expect(categories).toContain('visa');
      expect(categories).not.toContain('business');
    });

    it('throws NotFoundException when project not found', async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(service.findAllByUser(userId, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('does not re-seed a procedure that already has a tracking row', async () => {
      const apVisa = makeAP(1, 'visa', []);
      setupProject('work');
      adminProcedureRepo.find.mockResolvedValue([apVisa]);
      // existingTrackings already contains this procedure → the .some() branch matches
      trackingRepo.find.mockResolvedValueOnce([
        { admin_procedure: { idAdminProcedure: 1 } },
      ]);
      trackingRepo.find.mockResolvedValueOnce([
        {
          idProcedureTracking: 1,
          admin_procedure: apVisa,
          status: 'not_started',
        },
      ]);

      await service.findAllByUser(userId, projectId);

      expect(trackingRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser – without a projectId', () => {
    it('returns all trackings for the user directly', async () => {
      trackingRepo.find.mockResolvedValue([{ idProcedureTracking: 1 }]);

      const result = await service.findAllByUser(1);

      expect(trackingRepo.find).toHaveBeenCalledWith({
        where: { user: { idUser: 1 } },
        relations: ['admin_procedure', 'project'],
      });
      expect(result).toEqual([{ idProcedureTracking: 1 }]);
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

  describe('getBuddies()', () => {
    const makeTracking = (overrides: any = {}) => ({
      idProcedureTracking: 1,
      status: 'completed',
      end_date: '2026-08-01',
      user: {
        idUser: 2,
        firstName: 'Jane',
        buddyOptIn: true,
        originCountry: { countryName: 'Germany' },
      },
      ...overrides,
    });

    it('queries completed trackings for the given procedure/country, newest first, capped at 10', async () => {
      trackingRepo.find.mockResolvedValue([]);

      await service.getBuddies(5, 10, 99);

      expect(trackingRepo.find).toHaveBeenCalledWith({
        where: {
          admin_procedure: { idAdminProcedure: 5 },
          status: 'completed',
          project: { destinationCountryId: 10 },
        },
        relations: ['user', 'user.originCountry', 'project'],
        order: { end_date: 'DESC' },
        take: 10,
      });
    });

    it('excludes e2e and API-test accounts from the buddy list', async () => {
      trackingRepo.find.mockResolvedValue([
        makeTracking({
          user: {
            idUser: 13,
            firstName: 'E2e',
            email: 'e2e_notif_1783688635@skywalk.test',
            buddyOptIn: true,
            originCountry: null,
          },
        }),
        makeTracking({
          user: {
            idUser: 14,
            firstName: 'Test',
            email: 'test@example.com',
            buddyOptIn: true,
            originCountry: null,
          },
        }),
        makeTracking({
          user: {
            idUser: 15,
            firstName: 'Vraie',
            email: 'vraie.personne@gmail.com',
            buddyOptIn: true,
            originCountry: { countryName: 'Senegal' },
          },
        }),
      ]);

      const result = await service.getBuddies(5, 10, 99);

      expect(result.map((b) => b.firstname)).toEqual(['Vraie']);
    });

    it('excludes the current user from their own buddy list', async () => {
      trackingRepo.find.mockResolvedValue([
        makeTracking({ user: { idUser: 99, firstName: 'Me', buddyOptIn: true, originCountry: null } }),
      ]);

      const result = await service.getBuddies(5, 10, 99);

      expect(result).toEqual([]);
    });

    it('excludes trackings with no completion date', async () => {
      trackingRepo.find.mockResolvedValue([makeTracking({ end_date: null })]);

      const result = await service.getBuddies(5, 10, 1);

      expect(result).toEqual([]);
    });

    it('excludes users who opted out of the buddy system', async () => {
      trackingRepo.find.mockResolvedValue([
        makeTracking({ user: { idUser: 2, firstName: 'Jane', buddyOptIn: false, originCountry: null } }),
      ]);

      const result = await service.getBuddies(5, 10, 99);

      expect(result).toEqual([]);
    });

    it('maps eligible trackings to buddy summaries, capped at 3 results', async () => {
      const trackings = [1, 2, 3, 4].map((n) =>
        makeTracking({
          idProcedureTracking: n,
          end_date: `2026-08-0${n}`,
          user: {
            idUser: n + 1,
            firstName: `User${n}`,
            buddyOptIn: true,
            originCountry: { countryName: 'Spain' },
          },
        }),
      );
      trackingRepo.find.mockResolvedValue(trackings);

      const result = await service.getBuddies(5, 10, 99);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        idUser: 2,
        firstname: 'User1',
        originCountry: 'Spain',
        completedAt: '2026-08-01',
      });
    });

    it('falls back to a generic name and empty origin when missing', async () => {
      trackingRepo.find.mockResolvedValue([
        makeTracking({ user: { idUser: 2, firstName: undefined, buddyOptIn: true, originCountry: null } }),
      ]);

      const result = await service.getBuddies(5, 10, 99);

      expect(result[0]).toEqual({
        idUser: 2,
        firstname: "Quelqu'un",
        originCountry: '',
        completedAt: '2026-08-01',
      });
    });
  });
});
