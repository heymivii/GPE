import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminLogService } from './admin-log/admin-log.service';
import { ForumModerationService } from './forum-moderation/forum-moderation.service';
import { AdminLog } from './admin-log/entities/admin-log.entity';
import { ForumMessage } from './forum-message/entities/forum-message.entity';
import { ForumTopic } from './forum-topic/entities/forum-topic.entity';
import { User } from './user/entities/user.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
  })),
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

  it('creates a log entry', async () => {
    const log = { id: 1, action: 'user.verify_expert', adminId: 1 };
    logRepo.create.mockReturnValue(log);
    logRepo.save.mockResolvedValue(log);
    const result = await service.log({ adminId: 1, action: 'user.verify_expert', targetId: 2 });
    expect(logRepo.save).toHaveBeenCalled();
    expect(result.action).toBe('user.verify_expert');
  });

  it('returns all logs', async () => {
    logRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.findAll();
    expect(result).toHaveLength(2);
  });

  it('filters logs by admin ID', async () => {
    logRepo.find.mockResolvedValue([{ id: 1, adminId: 5 }]);
    const result = await service.findByAdmin(5);
    expect(result[0].adminId).toBe(5);
  });

  it('returns empty array when no logs', async () => {
    logRepo.find.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toHaveLength(0);
  });
});

describe('ForumModerationService', () => {
  let service: ForumModerationService;
  let messageRepo: any;
  let topicRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumModerationService,
        { provide: getRepositoryToken(ForumMessage), useFactory: mockRepo },
        { provide: getRepositoryToken(ForumTopic), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<ForumModerationService>(ForumModerationService);
    messageRepo = module.get(getRepositoryToken(ForumMessage));
    topicRepo = module.get(getRepositoryToken(ForumTopic));
    jest.clearAllMocks();
  });

  it('returns flagged messages', async () => {
    messageRepo.find.mockResolvedValue([{ idForumMessage: 1, isModerated: true }]);
    const result = await service.getFlaggedMessages();
    expect(result).toHaveLength(1);
    expect(result[0].isModerated).toBe(true);
  });

  it('throws NotFoundException when message does not exist', async () => {
    messageRepo.findOne.mockResolvedValue(null);
    await expect(service.approveMessage(999)).rejects.toThrow(NotFoundException);
  });

  it('approves a flagged message', async () => {
    const msg = { idForumMessage: 1, isModerated: true };
    messageRepo.findOne.mockResolvedValue(msg);
    messageRepo.save.mockResolvedValue({ ...msg, isModerated: false });
    await service.approveMessage(1);
    expect(messageRepo.save).toHaveBeenCalled();
  });

  it('deletes a flagged message', async () => {
    const msg = { idForumMessage: 1 };
    messageRepo.findOne.mockResolvedValue(msg);
    messageRepo.remove.mockResolvedValue(undefined);
    await service.deleteMessage(1);
    expect(messageRepo.remove).toHaveBeenCalledWith(msg);
  });

  it('returns flagged topics', async () => {
    topicRepo.find.mockResolvedValue([{ idForumTopic: 1 }]);
    const result = await service.getFlaggedTopics();
    expect(result).toHaveLength(1);
  });

  it('returns moderation statistics', async () => {
    messageRepo.count.mockResolvedValue(5);
    const result = await service.getStats();
    expect(result).toBeDefined();
  });
});
