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
): Partial<AdminProcedure> {
  return { idAdminProcedure: id, category, objectives: objectives ?? undefined, stepOrder: id };
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
        { provide: getRepositoryToken(ProcedureTracking), useValue: trackingRepo },
        { provide: getRepositoryToken(ExpatriationProject), useValue: projectRepo },
        { provide: getRepositoryToken(AdminProcedure), useValue: adminProcedureRepo },
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
        procedures.map((ap) => ({ idProcedureTracking: ap.idAdminProcedure, admin_procedure: ap, status: 'not_started' })),
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
      await expect(service.findAllByUser(userId, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
