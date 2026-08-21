import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminStatsService } from './admin-stats.service';
import { User } from '../user/entities/user.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { ForumTopic } from '../forum-topic/entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { Country } from '../country/entities/country.entity';
import { City } from '../city/entities/city.entity';

const mockRepo = () => ({
  count: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
  })),
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
        { provide: getRepositoryToken(ExpatriationProject), useFactory: mockRepo },
        { provide: getRepositoryToken(ForumTopic), useFactory: mockRepo },
        { provide: getRepositoryToken(ForumMessage), useFactory: mockRepo },
        { provide: getRepositoryToken(Country), useFactory: mockRepo },
        { provide: getRepositoryToken(City), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<AdminStatsService>(AdminStatsService);
    userRepo = module.get(getRepositoryToken(User));
    projectRepo = module.get(getRepositoryToken(ExpatriationProject));
    topicRepo = module.get(getRepositoryToken(ForumTopic));
    messageRepo = module.get(getRepositoryToken(ForumMessage));
    countryRepo = module.get(getRepositoryToken(Country));
    cityRepo = module.get(getRepositoryToken(City));
    jest.clearAllMocks();
  });

  it('returns counts for all entities', async () => {
    userRepo.count.mockResolvedValue(42);
    projectRepo.count.mockResolvedValue(15);
    topicRepo.count.mockResolvedValue(8);
    messageRepo.count.mockResolvedValue(100);
    countryRepo.count.mockResolvedValue(50);
    cityRepo.count.mockResolvedValue(200);
    projectRepo.find.mockResolvedValue([]);
    topicRepo.find.mockResolvedValue([]);
    const result = await service.getDashboardStats();
    expect(result.counts.users).toBe(42);
    expect(result.counts.projects).toBe(15);
  });

  it('returns timestamp in ISO format', async () => {
    userRepo.count.mockResolvedValue(0);
    projectRepo.count.mockResolvedValue(0);
    topicRepo.count.mockResolvedValue(0);
    messageRepo.count.mockResolvedValue(0);
    countryRepo.count.mockResolvedValue(0);
    cityRepo.count.mockResolvedValue(0);
    projectRepo.find.mockResolvedValue([]);
    topicRepo.find.mockResolvedValue([]);
    const result = await service.getDashboardStats();
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('returns recentActivity', async () => {
    userRepo.count.mockResolvedValue(0);
    projectRepo.count.mockResolvedValue(0);
    topicRepo.count.mockResolvedValue(0);
    messageRepo.count.mockResolvedValue(0);
    countryRepo.count.mockResolvedValue(0);
    cityRepo.count.mockResolvedValue(0);
    topicRepo.find.mockResolvedValue([]);
    projectRepo.find.mockResolvedValue([]);
    const result = await service.getDashboardStats();
    expect(result.recentActivity).toBeDefined();
  });
});
