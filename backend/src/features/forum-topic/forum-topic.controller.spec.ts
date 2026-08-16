import { Test, TestingModule } from '@nestjs/testing';
import { ForumTopicController } from './forum-topic.controller';
import { ForumTopicService } from './forum-topic.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  getStats: jest.fn(),
  findOne: jest.fn(),
  findOnePublic: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  lockTopic: jest.fn(),
  pinTopic: jest.fn(),
  moderatorRemove: jest.fn(),
  follow: jest.fn(),
  unfollow: jest.fn(),
  getFollowed: jest.fn(),
});

describe('ForumTopicController', () => {
  let controller: ForumTopicController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumTopicController],
      providers: [{ provide: ForumTopicService, useValue: service }],
    }).compile();

    controller = module.get<ForumTopicController>(ForumTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── create ────────────────────────────────────────────────────

  describe('create()', () => {
    it('should delegate to service.create', async () => {
      const dto = { title: 'T', content: 'C', category: 'question', idForumTopic: 1 };
      const topic = { idForumTopic: 1, ...dto };
      const req = { user: { userId: 1 } };
      service.create.mockResolvedValue(topic);

      const result = await controller.create(req, dto as any);
      expect(service.create).toHaveBeenCalledWith(1, dto);
      expect(result.idForumTopic).toBe(1);
    });
  });

  // ─── findAll ───────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return all topics', async () => {
      service.findAll.mockResolvedValue([{ idForumTopic: 1 }, { idForumTopic: 2 }]);

      const result = await controller.findAll();
      expect(result).toHaveLength(2);
    });
  });

  // ─── getStats ──────────────────────────────────────────────────

  describe('getStats()', () => {
    it('should return forum statistics', async () => {
      const stats = {
        totalTopics: 3,
        totalMessages: 8,
        last24h: 1,
        byCategory: [{ category: 'question', count: 2 }],
      };
      service.getStats.mockResolvedValue(stats);

      const result = await controller.getStats();
      expect(service.getStats).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a single topic and pass the optional user id', async () => {
      service.findOnePublic.mockResolvedValue({ idForumTopic: 5 });

      const result = await controller.findOne({ user: { userId: 9 } }, 5);
      expect(service.findOnePublic).toHaveBeenCalledWith(5, 9);
      expect(result.idForumTopic).toBe(5);
    });

    it('passes undefined userId when anonymous', async () => {
      service.findOnePublic.mockResolvedValue({ idForumTopic: 5 });
      await controller.findOne({ user: null }, 5);
      expect(service.findOnePublic).toHaveBeenCalledWith(5, undefined);
    });
  });

  // ─── follow / unfollow / followed ──────────────────────────────

  describe('follow()', () => {
    it('delegates to service.follow with the authenticated user', async () => {
      service.follow.mockResolvedValue({ following: true, followersCount: 1 });
      const result = await controller.follow({ user: { userId: 7 } }, 3);
      expect(service.follow).toHaveBeenCalledWith(7, 3);
      expect(result.following).toBe(true);
    });
  });

  describe('unfollow()', () => {
    it('delegates to service.unfollow with the authenticated user', async () => {
      service.unfollow.mockResolvedValue({ following: false, followersCount: 0 });
      await controller.unfollow({ user: { userId: 7 } }, 3);
      expect(service.unfollow).toHaveBeenCalledWith(7, 3);
    });
  });

  describe('getFollowed()', () => {
    it('returns the topics followed by the current user', async () => {
      service.getFollowed.mockResolvedValue([{ idForumTopic: 1 }]);
      const result = await controller.getFollowed({ user: { userId: 7 } });
      expect(service.getFollowed).toHaveBeenCalledWith(7);
      expect(result).toHaveLength(1);
    });
  });

  // ─── update ────────────────────────────────────────────────────

  describe('update()', () => {
    it('should delegate to service.update', async () => {
      const dto = { title: 'Updated' };
      const req = { user: { userId: 1 } };
      service.update.mockResolvedValue({ idForumTopic: 1, title: 'Updated' });

      const result = await controller.update(req, 1, dto as any);
      expect(service.update).toHaveBeenCalledWith(1, 1, dto);
      expect(result.title).toBe('Updated');
    });
  });

  // ─── remove ────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should delegate to service.remove', async () => {
      const req = { user: { userId: 1 } };
      service.remove.mockResolvedValue(undefined);

      await controller.remove(req, 3);
      expect(service.remove).toHaveBeenCalledWith(3, 1);
    });
  });

  // ─── lockTopic ─────────────────────────────────────────────────

  describe('lockTopic()', () => {
    it('should toggle lock', async () => {
      service.lockTopic.mockResolvedValue({ idForumTopic: 1, isLocked: true });

      const result = await controller.lockTopic(1);
      expect(service.lockTopic).toHaveBeenCalledWith(1);
      expect(result.isLocked).toBe(true);
    });
  });

  // ─── pinTopic ──────────────────────────────────────────────────

  describe('pinTopic()', () => {
    it('should toggle pin', async () => {
      service.pinTopic.mockResolvedValue({ idForumTopic: 1, isPinned: true });

      const result = await controller.pinTopic(1);
      expect(service.pinTopic).toHaveBeenCalledWith(1);
      expect(result.isPinned).toBe(true);
    });
  });

  // ─── moderatorRemove ──────────────────────────────────────────

  describe('moderatorRemove()', () => {
    it('should delegate to service.moderatorRemove', async () => {
      service.moderatorRemove.mockResolvedValue(undefined);

      await controller.moderatorRemove(7);
      expect(service.moderatorRemove).toHaveBeenCalledWith(7);
    });
  });
});
