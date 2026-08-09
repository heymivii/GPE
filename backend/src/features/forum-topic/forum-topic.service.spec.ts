import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ForumTopicService } from './forum-topic.service';
import { ForumTopic } from './entities/forum-topic.entity';
import { ForumTopicFollow } from './entities/forum-topic-follow.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { ContentFilterService } from '../forum-message/content-filter.service';
import { ForumModerationService } from '../forum-moderation/forum-moderation.service';

const mockTopicRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  increment: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockMessageRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

const mockFollowRepo = () => ({
  create: jest.fn((v) => v),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

const mockContentFilter = () => ({
  sanitize: jest.fn((c: string) => c.trim()),
  validate: jest.fn(
    async () => ({ ok: true }) as { ok: boolean; reason?: string },
  ),
});

describe('ForumTopicService', () => {
  let service: ForumTopicService;
  let topicRepo: ReturnType<typeof mockTopicRepo>;
  let followRepo: ReturnType<typeof mockFollowRepo>;
  let messageRepo: ReturnType<typeof mockMessageRepo>;
  let contentFilter: ReturnType<typeof mockContentFilter>;

  beforeEach(async () => {
    topicRepo = mockTopicRepo();
    followRepo = mockFollowRepo();
    messageRepo = mockMessageRepo();
    contentFilter = mockContentFilter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumTopicService,
        { provide: getRepositoryToken(ForumTopic), useValue: topicRepo },
        { provide: getRepositoryToken(ForumTopicFollow), useValue: followRepo },
        { provide: getRepositoryToken(ForumMessage), useValue: messageRepo },
        { provide: ContentFilterService, useValue: contentFilter },
        {
          provide: ForumModerationService,
          useValue: { moderate: jest.fn().mockResolvedValue({ action: 'ok' }) },
        },
      ],
    }).compile();

    service = module.get<ForumTopicService>(ForumTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── getStats() ────────────────────────────────────────────────

  describe('getStats()', () => {
    it('should aggregate counts and category breakdown', async () => {
      topicRepo.count
        .mockResolvedValueOnce(4) // totalTopics
        .mockResolvedValueOnce(1); // last24h
      messageRepo.count.mockResolvedValue(9); // totalMessages
      topicRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ category: 'question', count: '3' }]),
      });

      const stats = await service.getStats();

      expect(stats).toEqual({
        totalTopics: 4,
        totalMessages: 9,
        last24h: 1,
        byCategory: [{ category: 'question', count: 3 }],
      });
    });

    it('should default a null category to "other"', async () => {
      topicRepo.count.mockResolvedValue(0);
      messageRepo.count.mockResolvedValue(0);
      topicRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ category: null, count: '2' }]),
      });

      const stats = await service.getStats();

      expect(stats.byCategory).toEqual([{ category: 'other', count: 2 }]);
    });
  });

  // ─── create() ──────────────────────────────────────────────────

  describe('create()', () => {
    const dto = {
      title: 'Test Topic',
      content: 'This is a test topic content.',
      category: 'question',
      idForumTopic: 1,
    };

    it('should create a topic and its initial message', async () => {
      const savedTopic = { idForumTopic: 1, title: 'Test Topic' };
      topicRepo.create.mockReturnValue(savedTopic);
      topicRepo.save.mockResolvedValue(savedTopic);
      messageRepo.create.mockReturnValue({ content: dto.content });
      messageRepo.save.mockResolvedValue({
        idForumMessage: 1,
        content: dto.content,
      });

      const result = await service.create(1, dto as any);

      expect(contentFilter.validate).toHaveBeenCalledTimes(2); // title + content
      expect(contentFilter.sanitize).toHaveBeenCalledTimes(2);
      expect(topicRepo.save).toHaveBeenCalled();
      expect(messageRepo.save).toHaveBeenCalled();
      expect(result.idForumTopic).toBe(1);
    });

    it('should reject topic with bad title', async () => {
      contentFilter.validate.mockResolvedValueOnce({
        ok: false,
        reason: 'profanity',
      });

      await expect(service.create(1, dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject topic with bad content (title passes, content fails)', async () => {
      contentFilter.validate
        .mockResolvedValueOnce({ ok: true }) // title passes
        .mockResolvedValueOnce({ ok: false, reason: 'hate speech' }); // content fails

      await expect(service.create(1, dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── findOne() ─────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return topic with sorted messages', async () => {
      const topic = {
        idForumTopic: 1,
        messages: [
          { sentAt: '2026-02-10T12:00:00Z' },
          { sentAt: '2026-02-10T10:00:00Z' },
        ],
      };
      topicRepo.findOne.mockResolvedValue(topic);

      const result = await service.findOne(1);
      expect(result.idForumTopic).toBe(1);
      // Messages should be sorted ascending
      expect(
        new Date(result.messages[0].sentAt).getTime(),
      ).toBeLessThanOrEqual(new Date(result.messages[1].sentAt).getTime());
    });

    it('should throw NotFoundException if topic not found', async () => {
      topicRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update() ──────────────────────────────────────────────────

  describe('update()', () => {
    it('should update topic title with content filtering', async () => {
      const topic = {
        idForumTopic: 1,
        title: 'Old Title',
        messages: [],
        user: { idUser: 1 },
      };
      topicRepo.findOne.mockResolvedValue(topic);
      topicRepo.save.mockResolvedValue({ ...topic, title: 'New Title' });

      await service.update(1, 1, { title: 'New Title' } as any);

      expect(contentFilter.validate).toHaveBeenCalledWith('New Title');
      expect(topicRepo.save).toHaveBeenCalled();
    });

    it('should reject bad title on update', async () => {
      const topic = {
        idForumTopic: 1,
        title: 'Old',
        messages: [],
        user: { idUser: 1 },
      };
      topicRepo.findOne.mockResolvedValue(topic);
      contentFilter.validate.mockResolvedValue({
        ok: false,
        reason: 'profanity',
      });

      await expect(
        service.update(1, 1, { title: 'bad title' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── lockTopic() ──────────────────────────────────────────────

  describe('lockTopic()', () => {
    it('should toggle lock on a topic', async () => {
      const topic = { idForumTopic: 1, isLocked: false, messages: [] };
      topicRepo.findOne.mockResolvedValue(topic);
      topicRepo.save.mockImplementation(async (t) => t);

      const result = await service.lockTopic(1);
      expect(result.isLocked).toBe(true);
    });

    it('should unlock an already locked topic', async () => {
      const topic = { idForumTopic: 1, isLocked: true, messages: [] };
      topicRepo.findOne.mockResolvedValue(topic);
      topicRepo.save.mockImplementation(async (t) => t);

      const result = await service.lockTopic(1);
      expect(result.isLocked).toBe(false);
    });
  });

  // ─── pinTopic() ───────────────────────────────────────────────

  describe('pinTopic()', () => {
    it('should toggle pin on a topic', async () => {
      const topic = { idForumTopic: 1, isPinned: false, messages: [] };
      topicRepo.findOne.mockResolvedValue(topic);
      topicRepo.save.mockImplementation(async (t) => t);

      const result = await service.pinTopic(1);
      expect(result.isPinned).toBe(true);
    });
  });

  // ─── moderatorRemove() ─────────────────────────────────────────

  describe('moderatorRemove()', () => {
    it('should remove topic as moderator', async () => {
      const topic = { idForumTopic: 1, messages: [] };
      topicRepo.findOne.mockResolvedValue(topic);
      topicRepo.remove.mockResolvedValue(topic);

      await service.moderatorRemove(1);
      expect(topicRepo.remove).toHaveBeenCalledWith(topic);
    });

    it('should throw NotFoundException for missing topic', async () => {
      topicRepo.findOne.mockResolvedValue(null);

      await expect(service.moderatorRemove(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove() ──────────────────────────────────────────────────

  describe('remove()', () => {
    it('should delete a topic and its messages (owner)', async () => {
      const topic = { idForumTopic: 1, user: { idUser: 1 }, messages: [] };
      topicRepo.findOne.mockResolvedValue(topic);
      messageRepo.delete.mockResolvedValue({ affected: 0 });
      topicRepo.remove.mockResolvedValue(topic);

      await expect(service.remove(1, 1)).resolves.toBeUndefined();
      expect(topicRepo.remove).toHaveBeenCalledWith(topic);
    });

    it('should throw ForbiddenException if not the owner', async () => {
      const topic = { idForumTopic: 1, user: { idUser: 2 }, messages: [] };
      topicRepo.findOne.mockResolvedValue(topic);

      await expect(service.remove(1, 99)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if topic not found', async () => {
      topicRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── follow() ──────────────────────────────────────────────────

  describe('follow()', () => {
    it('creates a follow when none exists (idempotent) and returns the count', async () => {
      topicRepo.findOne.mockResolvedValue({ idForumTopic: 3, messages: [] });
      followRepo.findOne.mockResolvedValue(null);
      followRepo.save.mockResolvedValue({});
      followRepo.count.mockResolvedValue(1);

      const res = await service.follow(7, 3);

      expect(followRepo.save).toHaveBeenCalled();
      expect(res).toEqual({ following: true, followersCount: 1 });
    });

    it('does NOT create a duplicate when already following', async () => {
      topicRepo.findOne.mockResolvedValue({ idForumTopic: 3, messages: [] });
      followRepo.findOne.mockResolvedValue({ idForumTopicFollow: 1 });
      followRepo.count.mockResolvedValue(1);

      await service.follow(7, 3);
      expect(followRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFound when following a missing topic', async () => {
      topicRepo.findOne.mockResolvedValue(null);
      await expect(service.follow(7, 999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── unfollow() ────────────────────────────────────────────────

  describe('unfollow()', () => {
    it('deletes the follow row and returns the updated count', async () => {
      followRepo.delete.mockResolvedValue({ affected: 1 });
      followRepo.count.mockResolvedValue(0);

      const res = await service.unfollow(7, 3);
      expect(followRepo.delete).toHaveBeenCalledWith({ userId: 7, topicId: 3 });
      expect(res).toEqual({ following: false, followersCount: 0 });
    });
  });

  // ─── getFollowed() ─────────────────────────────────────────────

  describe('getFollowed()', () => {
    it('returns [] when the user follows nothing', async () => {
      followRepo.find.mockResolvedValue([]);
      expect(await service.getFollowed(7)).toEqual([]);
    });

    it('loads the followed topics with messagesCount', async () => {
      followRepo.find.mockResolvedValue([{ topicId: 1 }, { topicId: 2 }]);
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ idForumTopic: 1 }]),
      };
      topicRepo.createQueryBuilder.mockReturnValue(qb);

      const res = await service.getFollowed(7);
      expect(qb.where).toHaveBeenCalledWith('topic.idForumTopic IN (:...ids)', {
        ids: [1, 2],
      });
      expect(res).toHaveLength(1);
    });
  });

  // ─── findOnePublic() : followersCount / isFollowedByMe ─────────

  describe('findOnePublic()', () => {
    it('adds followersCount and isFollowedByMe=true for a follower', async () => {
      topicRepo.increment.mockResolvedValue(undefined);
      topicRepo.findOne.mockResolvedValue({ idForumTopic: 5, messages: [] });
      followRepo.count
        .mockResolvedValueOnce(3) // followersCount
        .mockResolvedValueOnce(1); // this user's follow

      const res = await service.findOnePublic(5, 7);
      expect(res.followersCount).toBe(3);
      expect(res.isFollowedByMe).toBe(true);
    });

    it('isFollowedByMe is false for an anonymous reader', async () => {
      topicRepo.increment.mockResolvedValue(undefined);
      topicRepo.findOne.mockResolvedValue({ idForumTopic: 5, messages: [] });
      followRepo.count.mockResolvedValueOnce(3); // followersCount only

      const res = await service.findOnePublic(5);
      expect(res.isFollowedByMe).toBe(false);
      expect(res.followersCount).toBe(3);
    });
  });
});
