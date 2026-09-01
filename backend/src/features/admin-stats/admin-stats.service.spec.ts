import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminStatsService } from './admin-stats.service';
import { User } from '../user/entities/user.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { ForumTopic } from '../forum-topic/entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { Country } from '../country/entities/country.entity';
import { City } from '../city/entities/city.entity';
import { TravelType } from '../project/travel-type/travel-type.entity';

const CHAIN_METHODS = [
  'select',
  'addSelect',
  'groupBy',
  'addGroupBy',
  'orderBy',
  'take',
  'innerJoin',
  'leftJoin',
  'where',
];

const makeQueryBuilder = (
  result: any,
  finalMethod: 'getRawMany' | 'getCount',
) => {
  const qb: any = {};
  CHAIN_METHODS.forEach((m) => {
    qb[m] = jest.fn().mockReturnValue(qb);
  });
  qb.getRawMany = jest
    .fn()
    .mockResolvedValue(finalMethod === 'getRawMany' ? result : []);
  qb.getCount = jest
    .fn()
    .mockResolvedValue(finalMethod === 'getCount' ? result : 0);
  return qb;
};

const mockRepo = () => ({
  count: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('AdminStatsService', () => {
  let service: AdminStatsService;
  let userRepo: any;
  let projectRepo: any;
  let topicRepo: any;
  let messageRepo: any;
  let countryRepo: any;
  let cityRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminStatsService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        {
          provide: getRepositoryToken(ExpatriationProject),
          useFactory: mockRepo,
        },
        { provide: getRepositoryToken(ForumTopic), useFactory: mockRepo },
        { provide: getRepositoryToken(ForumMessage), useFactory: mockRepo },
        { provide: getRepositoryToken(Country), useFactory: mockRepo },
        { provide: getRepositoryToken(City), useFactory: mockRepo },
        { provide: getRepositoryToken(TravelType), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<AdminStatsService>(AdminStatsService);
    userRepo = module.get(getRepositoryToken(User));
    projectRepo = module.get(getRepositoryToken(ExpatriationProject));
    topicRepo = module.get(getRepositoryToken(ForumTopic));
    messageRepo = module.get(getRepositoryToken(ForumMessage));
    countryRepo = module.get(getRepositoryToken(Country));
    cityRepo = module.get(getRepositoryToken(City));

    userRepo.count.mockResolvedValue(10);
    projectRepo.count.mockResolvedValue(5);
    topicRepo.count.mockResolvedValue(3);
    messageRepo.count.mockResolvedValue(20);
    countryRepo.count.mockResolvedValue(2);
    cityRepo.count.mockResolvedValue(4);

    projectRepo.createQueryBuilder
      .mockReturnValueOnce(
        makeQueryBuilder([{ status: 'draft', count: '2' }], 'getRawMany'),
      )
      .mockReturnValueOnce(
        makeQueryBuilder(
          [{ country: 'France', isoCode: 'FR', count: '3' }],
          'getRawMany',
        ),
      )
      .mockReturnValueOnce(
        makeQueryBuilder(
          [{ travelType: 'tourisme', count: '1' }],
          'getRawMany',
        ),
      );

    userRepo.createQueryBuilder
      .mockReturnValueOnce(
        makeQueryBuilder([{ role: 'user', count: '9' }], 'getRawMany'),
      )
      .mockReturnValueOnce(makeQueryBuilder(4, 'getCount'));

    projectRepo.find.mockResolvedValue([]);
    topicRepo.find.mockResolvedValue([]);
  });

  it('aggregates global counts', async () => {
    const result = await service.getGlobalStats();
    expect(result.counts).toEqual({
      users: 10,
      projects: 5,
      topics: 3,
      messages: 20,
      countries: 2,
      cities: 4,
      newUsersThisWeek: 4,
    });
  });

  it('exposes the grouped distributions', async () => {
    const result = await service.getGlobalStats();
    expect(result.distribution.projects).toEqual([
      { status: 'draft', count: '2' },
    ]);
    expect(result.distribution.users).toEqual([{ role: 'user', count: '9' }]);
    expect(result.distribution.destinations).toEqual([
      { country: 'France', isoCode: 'FR', count: '3' },
    ]);
    expect(result.distribution.travelTypes).toEqual([
      { travelType: 'tourisme', count: '1' },
    ]);
  });

  it('maps recent projects to a safe, flattened shape', async () => {
    projectRepo.find.mockResolvedValue([
      {
        idProject: 1,
        objective: 'travailler',
        status: 'draft',
        expectedDepartureDate: '2027-01-01',
        user: {
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'secret',
        },
        destinationCountry: { countryName: 'France', isoCode: 'FR' },
        travelType: { name: 'tourisme' },
      },
    ]);

    const result = await service.getGlobalStats();

    expect(result.recentActivity.projects[0]).toEqual({
      idProject: 1,
      objective: 'travailler',
      status: 'draft',
      expectedDepartureDate: '2027-01-01',
      user: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
      destinationCountry: { countryName: 'France', isoCode: 'FR' },
      travelType: 'tourisme',
    });
  });

  it('handles recent projects with no related user/country/travelType', async () => {
    projectRepo.find.mockResolvedValue([
      {
        idProject: 2,
        objective: null,
        status: 'draft',
        expectedDepartureDate: null,
        user: null,
        destinationCountry: null,
        travelType: null,
      },
    ]);

    const result = await service.getGlobalStats();

    expect(result.recentActivity.projects[0].user).toBeNull();
    expect(result.recentActivity.projects[0].destinationCountry).toBeNull();
    expect(result.recentActivity.projects[0].travelType).toBeNull();
  });

  it('includes an ISO timestamp', async () => {
    const result = await service.getGlobalStats();
    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });
});
