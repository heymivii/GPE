import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminLogService } from './admin-log/admin-log.service';
import { ForumModerationService } from './forum-moderation/forum-moderation.service';
import { AdminLog } from './admin-log/entities/admin-log.entity';
import { User } from './user/entities/user.entity';
import { ForbiddenWord } from './forum-moderation/entities/forbidden-word.entity';
import { UserWarning } from './forum-moderation/entities/user-warning.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  increment: jest.fn(),
});

describe('AdminLogService', () => {
  let service: AdminLogService;
  let logRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminLogService,
        { provide: getRepositoryToken(AdminLog), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<AdminLogService>(AdminLogService);
    logRepo = module.get(getRepositoryToken(AdminLog));
    jest.clearAllMocks();
  });

  it('creates a log entry with correct fields', async () => {
    const log = { idAdminLog: 1, userId: 1, action: 'user.verify_expert', entityType: 'user', entityId: '2' };
    logRepo.create.mockReturnValue(log);
    logRepo.save.mockResolvedValue(log);
    const result = await service.log(1, 'user.verify_expert', 'user', '2');
    expect(logRepo.save).toHaveBeenCalled();
    expect(result.action).toBe('user.verify_expert');
  });

  it('returns all logs ordered by id DESC', async () => {
    logRepo.find.mockResolvedValue([{ idAdminLog: 2 }, { idAdminLog: 1 }]);
    const result = await service.findAll();
    expect(result).toHaveLength(2);
    expect(result[0].idAdminLog).toBe(2);
  });

  it('returns empty array when no logs', async () => {
    logRepo.find.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toHaveLength(0);
  });

  it('logs with optional details', async () => {
    const log = { idAdminLog: 1, action: 'country.delete', details: 'Deleted France' };
    logRepo.create.mockReturnValue(log);
    logRepo.save.mockResolvedValue(log);
    const result = await service.log(1, 'country.delete', 'country', '3', 'Deleted France');
    expect(result.details).toBe('Deleted France');
  });
});

describe('ForumModerationService', () => {
  let service: ForumModerationService;
  let userRepo: any;
  let warningRepo: any;
  let wordRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumModerationService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        { provide: getRepositoryToken(UserWarning), useFactory: mockRepo },
        { provide: getRepositoryToken(ForbiddenWord), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<ForumModerationService>(ForumModerationService);
    userRepo = module.get(getRepositoryToken(User));
    warningRepo = module.get(getRepositoryToken(UserWarning));
    wordRepo = module.get(getRepositoryToken(ForbiddenWord));
    jest.clearAllMocks();
  });

  it('returns ok when no forbidden words configured', async () => {
    wordRepo.find.mockResolvedValue([]);
    const result = await service.moderate(1, 'Hello world');
    expect(result.action).toBe('ok');
  });

  it('flags content matching a medium severity word', async () => {
    wordRepo.find.mockResolvedValue([{ idForbiddenWord: 1, word: 'spam', severity: 'medium', isActive: true }]);
    warningRepo.create.mockReturnValue({});
    warningRepo.save.mockResolvedValue({});
    userRepo.increment.mockResolvedValue({});
    const result = await service.moderate(1, 'this is spam content');
    expect(result.action).toBe('flag');
  });

  it('blocks content matching a high severity word', async () => {
    wordRepo.find.mockResolvedValue([{ idForbiddenWord: 1, word: 'hate', severity: 'high', isActive: true }]);
    warningRepo.create.mockReturnValue({});
    warningRepo.save.mockResolvedValue({});
    userRepo.increment.mockResolvedValue({});
    const result = await service.moderate(1, 'I hate everything');
    expect(result.action).toBe('block');
  });

  it('returns flagged users above threshold', async () => {
    userRepo.find.mockResolvedValue([{ idUser: 1, warningCount: 5 }]);
    const result = await service.listFlaggedUsers(3);
    expect(result).toHaveLength(1);
    expect(result[0].warningCount).toBe(5);
  });

  it('returns warnings for a specific user', async () => {
    warningRepo.find.mockResolvedValue([{ id: 1, reason: 'Terme signale' }]);
    const result = await service.listUserWarnings(1);
    expect(result).toHaveLength(1);
  });

  it('returns empty list when no flagged users', async () => {
    userRepo.find.mockResolvedValue([]);
    const result = await service.listFlaggedUsers();
    expect(result).toHaveLength(0);
  });
});
