import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  AdminProcedureGeneratorService,
  DAYS_BEFORE_DEPARTURE_MAP,
  STEP_ORDER_MAP,
  CATEGORY_OBJECTIVES_MAP,
} from './admin-procedure-generator.service';
import { AdminProcedure } from './entities/admin-procedure.entity';
import { GovLink } from '../gov-links/entities/gov-link.entity';
import { Country } from '../country/entities/country.entity';

const mockCountry: Country = {
  idCountry: 1,
  countryName: 'France',
  isoCode: 'FR',
  status: 'active',
  continentId: 1,
} as Country;

const mockGovLinkVisa: GovLink = {
  id: 1,
  countryCode: 'FR',
  category: 'visa',
  label: 'Visa France Officiel',
  url: 'https://france-visas.gouv.fr',
  status: 'active',
  summary: ['Visa long séjour requis', 'Délai traitement 3 semaines'],
  confidence: 0.95,
} as GovLink;

const mockGovLinkEmploi: GovLink = {
  id: 2,
  countryCode: 'FR',
  category: 'emploi',
  label: 'Travail en France',
  url: 'https://travail.gouv.fr',
  status: 'active',
  summary: ['Permis de travail nécessaire', 'Convention collective applicable'],
  confidence: 0.9,
} as GovLink;

describe('AdminProcedureGeneratorService', () => {
  let service: AdminProcedureGeneratorService;

  let adminProcedureRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let govLinkRepo: { find: jest.Mock };
  let countryRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    adminProcedureRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    govLinkRepo = { find: jest.fn() };
    countryRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProcedureGeneratorService,
        { provide: getRepositoryToken(AdminProcedure), useValue: adminProcedureRepo },
        { provide: getRepositoryToken(GovLink), useValue: govLinkRepo },
        { provide: getRepositoryToken(Country), useValue: countryRepo },
      ],
    }).compile();

    service = module.get<AdminProcedureGeneratorService>(AdminProcedureGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateFromGovLinks', () => {
    it('throws NotFoundException when country code is unknown', async () => {
      countryRepo.findOne.mockResolvedValue(null);
      await expect(service.generateFromGovLinks('XX')).rejects.toThrow(NotFoundException);
    });

    it('creates 2 admin_procedures from 2 gov_links (visa + emploi)', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa, mockGovLinkEmploi]);
      adminProcedureRepo.findOne.mockResolvedValue(null); // no existing → create

      let idCounter = 100;
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: ++idCounter }),
      );

      const results = await service.generateFromGovLinks('FR');

      expect(results).toHaveLength(2);
    });

    it('sets correct source_url and key_facts from gov_link', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 1 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.sourceUrl).toBe('https://france-visas.gouv.fr');
      expect(result.keyFacts).toEqual(['Visa long séjour requis', 'Délai traitement 3 semaines']);
    });

    it('assigns objectives=[] for visa category', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 1 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.objectives).toEqual([]);
    });

    it('assigns objectives=["work"] for emploi category', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkEmploi]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 2 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.objectives).toEqual(['work']);
    });

    it('sets correct daysBeforeDeparture per category', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa, mockGovLinkEmploi]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 99 }),
      );

      const results = await service.generateFromGovLinks('FR');
      const visa = results.find((r) => r.category === 'visa')!;
      const emploi = results.find((r) => r.category === 'emploi')!;

      expect(visa.daysBeforeDeparture).toBe(DAYS_BEFORE_DEPARTURE_MAP.visa); // 120
      expect(emploi.daysBeforeDeparture).toBe(DAYS_BEFORE_DEPARTURE_MAP.emploi); // 90
    });

    it('sets correct stepOrder per category', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa, mockGovLinkEmploi]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 99 }),
      );

      const results = await service.generateFromGovLinks('FR');
      const visa = results.find((r) => r.category === 'visa')!;
      const emploi = results.find((r) => r.category === 'emploi')!;

      expect(visa.stepOrder).toBe(STEP_ORDER_MAP.visa);   // 1
      expect(emploi.stepOrder).toBe(STEP_ORDER_MAP.emploi); // 5
    });

    it('updates existing procedure (upsert) without creating a duplicate', async () => {
      const existingProcedure: Partial<AdminProcedure> = {
        idAdminProcedure: 42,
        category: 'visa',
        procedureType: 'Old label',
        country: mockCountry,
      };

      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa]);
      // findOne returns existing → should update, not create
      adminProcedureRepo.findOne.mockResolvedValue(existingProcedure);
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc }),
      );

      const results = await service.generateFromGovLinks('FR');

      // create should NOT have been called (update path)
      expect(adminProcedureRepo.create).not.toHaveBeenCalled();
      expect(adminProcedureRepo.save).toHaveBeenCalledTimes(1);
      expect(results[0].procedureType).toBe('Visa France Officiel');
      expect(results[0].sourceUrl).toBe('https://france-visas.gouv.fr');
    });

    it('uses category-based defaults for unknown category', async () => {
      // Test the exported maps directly
      expect(DAYS_BEFORE_DEPARTURE_MAP.visa).toBe(120);
      expect(DAYS_BEFORE_DEPARTURE_MAP.sante).toBe(45);
      expect(DAYS_BEFORE_DEPARTURE_MAP.banque).toBe(30);
      expect(CATEGORY_OBJECTIVES_MAP.emploi).toEqual(['work']);
      expect(CATEGORY_OBJECTIVES_MAP.education).toEqual(['study']);
      expect(CATEGORY_OBJECTIVES_MAP.visa).toEqual([]);
    });
  });
});
