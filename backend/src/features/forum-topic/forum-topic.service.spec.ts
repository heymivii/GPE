import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ForumTopicService } from './forum-topic.service';
import { ForumTopic } from './entities/forum-topic.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';
import { ContentFilterService } from '../forum-message/content-filter.service';

const mockTopicRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
});

const mockMessageRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
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
  let messageRepo: ReturnType<typeof mockMessageRepo>;
  let contentFilter: ReturnType<typeof mockContentFilter>;

  beforeEach(async () => {
    topicRepo = mockTopicRepo();
    messageRepo = mockMessageRepo();
    contentFilter = mockContentFilter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumTopicService,
        { provide: getRepositoryToken(ForumTopic), useValue: topicRepo },
        { provide: getRepositoryToken(ForumMessage), useValue: messageRepo },
        { provide: ContentFilterService, useValue: contentFilter },
      ],
    }).compile();

    service = module.get<ForumTopicService>(ForumTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const result = await service.create(dto as any);

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

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject topic with bad content (title passes, content fails)', async () => {
      contentFilter.validate
        .mockResolvedValueOnce({ ok: true }) // title passes
        .mockResolvedValueOnce({ ok: false, reason: 'hate speech' }); // content fails

      await expect(service.create(dto as any)).rejects.toThrow(
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
      const topic = { idForumTopic: 1, title: 'Old Title', messages: [] };
      topicRepo.findOne.mockResolvedValue(topic);
      topicRepo.save.mockResolvedValue({ ...topic, title: 'New Title' });

      await service.update(1, { title: 'New Title' } as any);

      expect(contentFilter.validate).toHaveBeenCalledWith('New Title');
      expect(topicRepo.save).toHaveBeenCalled();
    });

    it('should reject bad title on update', async () => {
      const topic = { idForumTopic: 1, title: 'Old', messages: [] };
      topicRepo.findOne.mockResolvedValue(topic);
      contentFilter.validate.mockResolvedValue({
        ok: false,
        reason: 'profanity',
      });

      await expect(
        service.update(1, { title: 'bad title' } as any),
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
    it('should delete a topic', async () => {
      topicRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if nothing deleted', async () => {
      topicRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
