import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { ForumTopic } from '../forum-topic/entities/forum-topic.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { Resource } from '../resource/entities/resource.entity';
import { CostOfLivingService } from '../cost-of-living/cost-of-living.service';
import { AdzunaService } from '../job-offer/adzuna.service';

const CHAIN_METHODS = [
  'leftJoinAndSelect',
  'innerJoin',
  'where',
  'orderBy',
  'select',
  'addSelect',
  'groupBy',
];

const makeQueryBuilder = (result: any, method: 'getMany' | 'getRawMany') => {
  const qb: any = {};
  CHAIN_METHODS.forEach((m) => {
    qb[m] = jest.fn().mockReturnValue(qb);
  });
  qb.getMany = jest.fn().mockResolvedValue(method === 'getMany' ? result : []);
  qb.getRawMany = jest
    .fn()
    .mockResolvedValue(method === 'getRawMany' ? result : []);
  return qb;
};

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('DestinationsService', () => {
  let service: DestinationsService;
  let cityRepo: any;
  let countryRepo: any;
  let forumTopicRepo: any;
  let projectRepo: any;
  let resourceRepo: any;
  let costOfLivingService: any;
  let adzunaService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DestinationsService,
        { provide: getRepositoryToken(City), useFactory: mockRepo },
        { provide: getRepositoryToken(Country), useFactory: mockRepo },
        { provide: getRepositoryToken(ForumTopic), useFactory: mockRepo },
        {
          provide: getRepositoryToken(ExpatriationProject),
          useFactory: mockRepo,
        },
        { provide: getRepositoryToken(Resource), useFactory: mockRepo },
        {
          provide: CostOfLivingService,
          useValue: { getCachedDataByCityId: jest.fn() },
        },
        { provide: AdzunaService, useValue: { searchJobs: jest.fn() } },
      ],
    }).compile();

    service = module.get<DestinationsService>(DestinationsService);
    cityRepo = module.get(getRepositoryToken(City));
    countryRepo = module.get(getRepositoryToken(Country));
    forumTopicRepo = module.get(getRepositoryToken(ForumTopic));
    projectRepo = module.get(getRepositoryToken(ExpatriationProject));
    resourceRepo = module.get(getRepositoryToken(Resource));
    costOfLivingService = module.get(CostOfLivingService);
    adzunaService = module.get(AdzunaService);
  });

  describe('findAll', () => {
    it('returns cities ordered by name with country relation', async () => {
      cityRepo.find.mockResolvedValue([{ idCity: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(cityRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['country'],
          order: { name: 'ASC' },
        }),
      );
    });
  });

  describe('findAllEnriched', () => {
    it('returns cities with country via the query builder', async () => {
      cityRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([{ idCity: 1, name: 'Paris' }], 'getMany'),
      );
      const result = await service.findAllEnriched();
      expect(result).toEqual([{ idCity: 1, name: 'Paris' }]);
    });
  });

  describe('findOneBySlug', () => {
    it('throws NotFoundException when no city matches the name', async () => {
      cityRepo.findOne.mockResolvedValue(null);
      await expect(service.findOneBySlug('nowhere')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the matching city', async () => {
      const city = { idCity: 1, name: 'Paris' };
      cityRepo.findOne.mockResolvedValue(city);
      const result = await service.findOneBySlug('Paris');
      expect(result).toEqual(city);
    });
  });

  describe('findOneCountryBySlug', () => {
    const baseCountry = {
      idCountry: 1,
      countryName: 'France',
      isoCode: 'FR',
    };

    beforeEach(() => {
      cityRepo.find.mockResolvedValue([]);
      forumTopicRepo.count.mockResolvedValue(0);
      projectRepo.count.mockResolvedValue(0);
      resourceRepo.count.mockResolvedValue(0);
      adzunaService.searchJobs.mockResolvedValue({ total: 0 });
    });

    it('ne renvoie QUE les villes validées (ni archivées, ni en attente de revue)', async () => {
      // Le pays était filtré sur status='active' mais pas ses villes : la page
      // publique montrait les 5 villes archivées du Japon et « Bretagne »,
      // encore en attente de vérification côté admin.
      countryRepo.findOne.mockResolvedValue(baseCountry);

      await service.findOneCountryBySlug('fr');

      expect(cityRepo.find).toHaveBeenCalledWith({
        where: { countryId: 1, status: 'active' },
        order: { name: 'ASC' },
      });
    });

    it('resolves a 2-letter slug via ISO code lookup', async () => {
      countryRepo.findOne.mockResolvedValue(baseCountry);
      const result = await service.findOneCountryBySlug('fr');
      expect(countryRepo.findOne).toHaveBeenCalledWith({
        where: { isoCode: 'FR' },
      });
      expect(result.countryName).toBe('France');
    });

    it('resolves a full-name slug via exact countryName match', async () => {
      countryRepo.findOne.mockResolvedValue(baseCountry);
      const result = await service.findOneCountryBySlug('France');
      expect(result.countryName).toBe('France');
    });

    it('falls back to a slugified match when exact name lookup fails', async () => {
      countryRepo.findOne.mockResolvedValue(null);
      countryRepo.find.mockResolvedValue([
        baseCountry,
        { idCountry: 2, countryName: 'Espagne', isoCode: 'ES' },
      ]);
      const result = await service.findOneCountryBySlug('france');
      expect(result.countryName).toBe('France');
    });

    it('throws NotFoundException when nothing matches', async () => {
      countryRepo.findOne.mockResolvedValue(null);
      countryRepo.find.mockResolvedValue([]);
      await expect(service.findOneCountryBySlug('atlantide')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('computes average housing cost from cities that have cached cost data', async () => {
      countryRepo.findOne.mockResolvedValue(baseCountry);
      cityRepo.find.mockResolvedValue([
        { idCity: 10, name: 'Paris' },
        { idCity: 11, name: 'Lyon' },
      ]);
      costOfLivingService.getCachedDataByCityId
        .mockResolvedValueOnce({
          categories: {
            housing: { rent: { oneBedroom: { cityCenter: { avg: 1000 } } } },
          },
        })
        .mockResolvedValueOnce({
          categories: {
            housing: { rent: { oneBedroom: { cityCenter: { avg: 800 } } } },
          },
        });
      adzunaService.searchJobs.mockResolvedValue({ total: 5 });

      const result = await service.findOneCountryBySlug('fr');

      expect(result.costOfLiving.averageHousing).toBe('900.00');
      expect(result.stats.jobOffersCount).toBe(5);
    });

    it('returns null average housing when no city has cached cost data', async () => {
      countryRepo.findOne.mockResolvedValue(baseCountry);
      cityRepo.find.mockResolvedValue([{ idCity: 10, name: 'Paris' }]);
      costOfLivingService.getCachedDataByCityId.mockResolvedValue(null);

      const result = await service.findOneCountryBySlug('fr');

      expect(result.costOfLiving.averageHousing).toBeNull();
    });

    it('skips the Adzuna call and returns null (hors couverture Adzuna) for unmapped countries', async () => {
      countryRepo.findOne.mockResolvedValue({
        idCountry: 9,
        countryName: 'Atlantide',
        isoCode: 'ZZ',
      });

      const result = await service.findOneCountryBySlug('zz');

      expect(adzunaService.searchJobs).not.toHaveBeenCalled();
      expect(result.stats.jobOffersCount).toBeNull();
    });

    it('falls back to null when Adzuna call fails', async () => {
      countryRepo.findOne.mockResolvedValue(baseCountry);
      adzunaService.searchJobs.mockRejectedValue(new Error('adzuna down'));

      const result = await service.findOneCountryBySlug('fr');

      expect(result.stats.jobOffersCount).toBeNull();
    });
  });

  describe('findAllCountries', () => {
    it('aggregates stats per country and applies image fallback', async () => {
      countryRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder(
          [{ idCountry: 1, countryName: 'France', isoCode: 'FR' }],
          'getMany',
        ),
      );
      forumTopicRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([{ countryId: 1, count: '2' }], 'getRawMany'),
      );
      projectRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([{ countryId: 1, count: '3' }], 'getRawMany'),
      );
      resourceRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([{ countryId: 1, count: '4' }], 'getRawMany'),
      );
      adzunaService.searchJobs.mockResolvedValue({ total: 7 });

      const result = await service.findAllCountries();

      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toContain('unsplash.com');
      expect(result[0].stats).toEqual({
        memberCount: 3,
        jobOffersCount: 7,
        forumTopicsCount: 2,
        resourcesCount: 4,
      });
    });

    it('skips the Adzuna call and defaults to null (hors couverture Adzuna) for unmapped countries', async () => {
      countryRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder(
          [{ idCountry: 9, countryName: 'Atlantide', isoCode: 'ZZ' }],
          'getMany',
        ),
      );
      forumTopicRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );
      projectRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );
      resourceRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );

      const result = await service.findAllCountries();

      expect(adzunaService.searchJobs).not.toHaveBeenCalled();
      expect(result[0].stats.jobOffersCount).toBeNull();
    });

    it('falls back to null when the Adzuna call fails', async () => {
      countryRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder(
          [{ idCountry: 1, countryName: 'France', isoCode: 'FR' }],
          'getMany',
        ),
      );
      forumTopicRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );
      projectRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );
      resourceRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );
      adzunaService.searchJobs.mockRejectedValue(new Error('adzuna down'));

      const result = await service.findAllCountries();

      expect(result[0].stats.jobOffersCount).toBeNull();
    });

    it('defaults counts to 0 for countries absent from the aggregated maps', async () => {
      countryRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder(
          [{ idCountry: 1, countryName: 'France', isoCode: 'FR' }],
          'getMany',
        ),
      );
      forumTopicRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );
      projectRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );
      resourceRepo.createQueryBuilder.mockReturnValue(
        makeQueryBuilder([], 'getRawMany'),
      );
      adzunaService.searchJobs.mockResolvedValue({ total: 0 });

      const result = await service.findAllCountries();

      expect(result[0].stats).toEqual({
        memberCount: 0,
        jobOffersCount: 0,
        forumTopicsCount: 0,
        resourcesCount: 0,
      });
    });
  });
});
