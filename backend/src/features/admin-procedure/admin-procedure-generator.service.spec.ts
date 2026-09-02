import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  AdminProcedureGeneratorService,
  DAYS_BEFORE_DEPARTURE_MAP,
  STEP_ORDER_MAP,
  CATEGORY_OBJECTIVES_MAP,
  CATEGORY_FR_TITLE_MAP,
  CATEGORY_PHASE_MAP,
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
  actions: ['Préparer un passeport valide ≥ 6 mois', 'Remplir le formulaire de demande', 'Prendre rendez-vous au consulat'],
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
  actions: ['Obtenir un permis de travail', 'Contacter l\'employeur pour le contrat'],
  confidence: 0.9,
} as GovLink;

const mockGovLinkSante: GovLink = {
  id: 3,
  countryCode: 'FR',
  category: 'sante',
  label: 'Health in France',
  url: 'https://ameli.fr',
  status: 'active',
  summary: ['Inscription CPAM requise'],
  actions: ['S\'inscrire à la CPAM'],
  confidence: 0.85,
} as GovLink;

describe('AdminProcedureGeneratorService', () => {
  let service: AdminProcedureGeneratorService;

  let adminProcedureRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let govLinkRepo: { find: jest.Mock };
  let countryRepo: { findOne: jest.Mock };

  /** Default no-op query builder chain used by the archive step in generateFromGovLinks. */
  function makeQbChain() {
    const chain: any = {};
    chain.update = jest.fn(() => chain);
    chain.set = jest.fn(() => chain);
    chain.where = jest.fn(() => chain);
    chain.andWhere = jest.fn(() => chain);
    chain.execute = jest.fn(async () => ({ affected: 0 }));
    return chain;
  }

  beforeEach(async () => {
    adminProcedureRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => makeQbChain()),
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

    it('copies actionItems from gov_link.actions', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 1 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.actionItems).toEqual([
        'Préparer un passeport valide ≥ 6 mois',
        'Remplir le formulaire de demande',
        'Prendre rendez-vous au consulat',
      ]);
    });

    it('sets actionItems to [] when gov_link has no actions', async () => {
      const linkWithoutActions: GovLink = { ...mockGovLinkVisa, actions: undefined } as GovLink;
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([linkWithoutActions]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 1 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.actionItems).toEqual([]);
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

    // ── FR title map: procedureType must come from CATEGORY_FR_TITLE_MAP ──────

    it('sets procedureType from the French category-title map (not gov_link.label) for visa', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 1 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      // Must be the French title, NOT the gov_link label ('Visa France Officiel')
      expect(result.procedureType).toBe(CATEGORY_FR_TITLE_MAP.visa);
      expect(result.procedureType).toBe('Visa & entrée');
      expect(result.procedureType).not.toBe(mockGovLinkVisa.label);
    });

    it('sets procedureType from the French category-title map for sante', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkSante]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 3 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      // 'Health in France' label must NOT appear
      expect(result.procedureType).toBe(CATEGORY_FR_TITLE_MAP.sante);
      expect(result.procedureType).toBe('Assurance maladie & santé');
      expect(result.procedureType).not.toBe(mockGovLinkSante.label);
    });

    it('sets procedureType from the French category-title map for emploi', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkEmploi]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 2 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.procedureType).toBe(CATEGORY_FR_TITLE_MAP.emploi);
      expect(result.procedureType).toBe('Travail & emploi');
    });

    // ── Phase map ────────────────────────────────────────────────────────────

    it('sets phase="before" for visa category', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 1 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.phase).toBe('before');
      expect(CATEGORY_PHASE_MAP.visa).toBe('before');
    });

    it('sets phase="on_arrival" for sante category', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkSante]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 3 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.phase).toBe('on_arrival');
      expect(CATEGORY_PHASE_MAP.sante).toBe('on_arrival');
    });

    it('sets phase="on_arrival" for emploi category', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkEmploi]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 2 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.phase).toBe('on_arrival');
    });

    // ── Upsert ───────────────────────────────────────────────────────────────

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
      // procedureType must be the FR title, not the old/English label
      expect(results[0].procedureType).toBe(CATEGORY_FR_TITLE_MAP.visa);
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

    it('CATEGORY_FR_TITLE_MAP covers expected categories', () => {
      expect(CATEGORY_FR_TITLE_MAP.visa).toBe('Visa & entrée');
      expect(CATEGORY_FR_TITLE_MAP.demarches).toBe('Titre de séjour');
      expect(CATEGORY_FR_TITLE_MAP.sante).toBe('Assurance maladie & santé');
      expect(CATEGORY_FR_TITLE_MAP.banque).toBe('Compte bancaire');
      expect(CATEGORY_FR_TITLE_MAP.logement).toBe('Logement');
      expect(CATEGORY_FR_TITLE_MAP.transport).toBe('Transport & permis de conduire');
      expect(CATEGORY_FR_TITLE_MAP.emploi).toBe('Travail & emploi');
      expect(CATEGORY_FR_TITLE_MAP.education).toBe('Études');
    });

    it('CATEGORY_PHASE_MAP has visa=before and all others=on_arrival', () => {
      expect(CATEGORY_PHASE_MAP.visa).toBe('before');
      expect(CATEGORY_PHASE_MAP.demarches).toBe('on_arrival');
      expect(CATEGORY_PHASE_MAP.sante).toBe('on_arrival');
      expect(CATEGORY_PHASE_MAP.banque).toBe('on_arrival');
      expect(CATEGORY_PHASE_MAP.logement).toBe('on_arrival');
      expect(CATEGORY_PHASE_MAP.transport).toBe('on_arrival');
      expect(CATEGORY_PHASE_MAP.emploi).toBe('on_arrival');
      expect(CATEGORY_PHASE_MAP.education).toBe('on_arrival');
    });

    // ── culture category ──────────────────────────────────────────────────────

    it('CATEGORY_FR_TITLE_MAP has "Vie culturelle" for culture', () => {
      expect(CATEGORY_FR_TITLE_MAP.culture).toBe('Vie culturelle');
    });

    it('CATEGORY_PHASE_MAP has culture=on_arrival', () => {
      expect(CATEGORY_PHASE_MAP.culture).toBe('on_arrival');
    });

    it('DAYS_BEFORE_DEPARTURE_MAP has culture=30', () => {
      expect(DAYS_BEFORE_DEPARTURE_MAP.culture).toBe(30);
    });

    it('STEP_ORDER_MAP has culture=9', () => {
      expect(STEP_ORDER_MAP.culture).toBe(10);
    });

    it('CATEGORY_OBJECTIVES_MAP has culture=[] (applies to all expats)', () => {
      expect(CATEGORY_OBJECTIVES_MAP.culture).toEqual([]);
    });

    it('generates admin procedure with correct French title for culture gov_link', async () => {
      const mockGovLinkCulture: GovLink = {
        id: 10,
        countryCode: 'FR',
        category: 'culture',
        label: 'Cultural life in France',
        url: 'https://culture.gouv.fr',
        status: 'active',
        summary: ['Associations culturelles accessibles aux étrangers'],
        actions: ["S'inscrire dans une association"],
        confidence: 0.8,
      } as GovLink;

      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkCulture]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 10 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.procedureType).toBe('Vie culturelle');
      expect(result.phase).toBe('on_arrival');
      expect(result.stepOrder).toBe(STEP_ORDER_MAP.culture);
      expect(result.daysBeforeDeparture).toBe(DAYS_BEFORE_DEPARTURE_MAP.culture);
      expect(result.objectives).toEqual([]);
    });

    // ── business category ─────────────────────────────────────────────────────

    it('CATEGORY_FR_TITLE_MAP has "Créer une entreprise" for business', () => {
      expect(CATEGORY_FR_TITLE_MAP.business).toBe('Créer une entreprise');
    });

    it('CATEGORY_PHASE_MAP has business=on_arrival', () => {
      expect(CATEGORY_PHASE_MAP.business).toBe('on_arrival');
    });

    it('DAYS_BEFORE_DEPARTURE_MAP has business=60', () => {
      expect(DAYS_BEFORE_DEPARTURE_MAP.business).toBe(60);
    });

    it('STEP_ORDER_MAP has business=8', () => {
      expect(STEP_ORDER_MAP.business).toBe(9);
    });

    it('CATEGORY_OBJECTIVES_MAP has business=[] (applies to all expats)', () => {
      expect(CATEGORY_OBJECTIVES_MAP.business).toEqual([]);
    });

    it('generates admin procedure with correct French title for business gov_link', async () => {
      const mockGovLinkBusiness: GovLink = {
        id: 11,
        countryCode: 'FR',
        category: 'business',
        label: 'Start a business in France',
        url: 'https://entreprises.gouv.fr',
        status: 'active',
        summary: ['Création d\'entreprise possible sous visa long séjour'],
        actions: ["Choisir le statut juridique", "Immatriculer l'entreprise au RCS"],
        confidence: 0.85,
      } as GovLink;

      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkBusiness]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) =>
        Promise.resolve({ ...proc, idAdminProcedure: 11 }),
      );

      const [result] = await service.generateFromGovLinks('FR');

      expect(result.procedureType).toBe('Créer une entreprise');
      expect(result.phase).toBe('on_arrival');
      expect(result.stepOrder).toBe(STEP_ORDER_MAP.business);
      expect(result.daysBeforeDeparture).toBe(DAYS_BEFORE_DEPARTURE_MAP.business);
      expect(result.objectives).toEqual([]);
    });

    // ── Cascade archive + status='active' on upsert ──────────────────────────────

    it('sets status="active" on upserted procedures', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) => Promise.resolve({ ...proc, idAdminProcedure: 1 }));

      // We need createQueryBuilder for the archive step
      const qbChain = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };
      (adminProcedureRepo as any).createQueryBuilder = jest.fn(() => qbChain);

      const [result] = await service.generateFromGovLinks('FR');
      expect(result.status).toBe('active');
    });

    it('archives procedures whose category has no active gov_link', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      // Only visa is active
      govLinkRepo.find.mockResolvedValue([mockGovLinkVisa]);
      adminProcedureRepo.findOne.mockResolvedValue(null);
      adminProcedureRepo.create.mockImplementation((data) => ({ ...data }));
      adminProcedureRepo.save.mockImplementation((proc) => Promise.resolve({ ...proc, idAdminProcedure: 1 }));

      const qbChain = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };
      (adminProcedureRepo as any).createQueryBuilder = jest.fn(() => qbChain);

      await service.generateFromGovLinks('FR');

      expect(qbChain.set).toHaveBeenCalledWith({ status: 'archived' });
      expect(qbChain.andWhere).toHaveBeenCalledWith(
        'category NOT IN (:...activeCategories)',
        { activeCategories: ['visa'] },
      );
      expect(qbChain.execute).toHaveBeenCalled();
    });

    it('archives ALL procedures when no active gov_links exist', async () => {
      countryRepo.findOne.mockResolvedValue(mockCountry);
      govLinkRepo.find.mockResolvedValue([]);

      const qbChain = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };
      (adminProcedureRepo as any).createQueryBuilder = jest.fn(() => qbChain);

      await service.generateFromGovLinks('FR');

      expect(qbChain.set).toHaveBeenCalledWith({ status: 'archived' });
      // No andWhere — archive everything
      expect(qbChain.andWhere).not.toHaveBeenCalled();
      expect(qbChain.execute).toHaveBeenCalled();
    });
  });
});
