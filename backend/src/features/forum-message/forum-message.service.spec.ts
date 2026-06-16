import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ForumMessageService } from './forum-message.service';
import { ForumMessage } from './entities/forum-message.entity';
import { ForumReport } from './entities/forum-report.entity';
import { ContentFilterService } from './content-filter.service';

const mockMessageRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockReportRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
});

const mockContentFilter = () => ({
  sanitize: jest.fn((c: string) => c.trim()),
  validate: jest.fn(
    async () => ({ ok: true }) as { ok: boolean; reason?: string },
  ),
});

describe('ForumMessageService', () => {
  let service: ForumMessageService;
  let messageRepo: ReturnType<typeof mockMessageRepo>;
  let reportRepo: ReturnType<typeof mockReportRepo>;
  let contentFilter: ReturnType<typeof mockContentFilter>;

  beforeEach(async () => {
    messageRepo = mockMessageRepo();
    reportRepo = mockReportRepo();
    contentFilter = mockContentFilter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumMessageService,
        { provide: getRepositoryToken(ForumMessage), useValue: messageRepo },
        { provide: getRepositoryToken(ForumReport), useValue: reportRepo },
        { provide: ContentFilterService, useValue: contentFilter },
      ],
    }).compile();

    service = module.get<ForumMessageService>(ForumMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create() ──────────────────────────────────────────────────

  describe('create()', () => {
    const dto = { content: 'Hello World', topicId: 1, userId: 42 };

    it('should create a message with sanitized content', async () => {
      const message = { idForumMessage: 1, content: 'Hello World' };
      messageRepo.create.mockReturnValue(message);
      messageRepo.save.mockResolvedValue(message);

      const result = await service.create(dto);

      expect(contentFilter.sanitize).toHaveBeenCalledWith('Hello World');
      expect(contentFilter.validate).toHaveBeenCalled();
      expect(messageRepo.create).toHaveBeenCalled();
      expect(messageRepo.save).toHaveBeenCalledWith(message);
      expect(result).toEqual(message);
    });

    it('should throw BadRequestException if content is rejected', async () => {
      contentFilter.validate.mockResolvedValue({
        ok: false,
        reason: 'profanity',
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with rejection reason', async () => {
      contentFilter.validate.mockResolvedValue({
        ok: false,
        reason: 'hate speech',
      });

      try {
        await service.create(dto);
        fail('Should have thrown');
      } catch (err) {
        expect(err.message).toContain('hate speech');
      }
    });
  });

  // ─── findOne() ─────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a message by id', async () => {
      const message = { idForumMessage: 1, content: 'test' };
      messageRepo.findOne.mockResolvedValue(message);

      const result = await service.findOne(1);
      expect(result).toEqual(message);
    });

    it('should throw NotFoundException if not found', async () => {
      messageRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update() ──────────────────────────────────────────────────

  describe('update()', () => {
    it('should update message content with filtering', async () => {
      const existing = { idForumMessage: 1, content: 'old' };
      messageRepo.findOne.mockResolvedValue(existing);
      messageRepo.save.mockResolvedValue({
        ...existing,
        content: 'new content',
      });

      await service.update(1, { content: 'new content' });

      expect(contentFilter.sanitize).toHaveBeenCalledWith('new content');
      expect(contentFilter.validate).toHaveBeenCalled();
      expect(messageRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if updated content is rejected', async () => {
      const existing = { idForumMessage: 1, content: 'old' };
      messageRepo.findOne.mockResolvedValue(existing);
      contentFilter.validate.mockResolvedValue({ ok: false, reason: 'spam' });

      await expect(
        service.update(1, { content: 'spam content' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if message not found', async () => {
      messageRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { content: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove() ──────────────────────────────────────────────────

  describe('remove()', () => {
    it('should delete a message', async () => {
      messageRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(messageRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if nothing deleted', async () => {
      messageRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── moderatorRemove() ─────────────────────────────────────────

  describe('moderatorRemove()', () => {
    it('should delete any message as moderator', async () => {
      const message = { idForumMessage: 5, content: 'to delete' };
      messageRepo.findOne.mockResolvedValue(message);
      messageRepo.delete.mockResolvedValue({ affected: 1 });

      await service.moderatorRemove(5);
      expect(messageRepo.delete).toHaveBeenCalledWith(5);
    });

    it('should throw NotFoundException if message not found', async () => {
      messageRepo.findOne.mockResolvedValue(null);

      await expect(service.moderatorRemove(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Reports ───────────────────────────────────────────────────

  describe('createReport()', () => {
    const dto = {
      reporterId: 1,
      messageId: 10,
      reason: 'spam' as any,
      details: 'This is spam',
    };

    it('should create a report', async () => {
      reportRepo.findOne.mockResolvedValue(null); // no duplicate
      const report = { idReport: 1, ...dto };
      reportRepo.create.mockReturnValue(report);
      reportRepo.save.mockResolvedValue(report);

      const result = await service.createReport(dto);
      expect(result.idReport).toBe(1);
      expect(reportRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException on duplicate report', async () => {
      reportRepo.findOne.mockResolvedValue({ idReport: 99 }); // existing

      await expect(service.createReport(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resolveReport()', () => {
    it('should mark report as resolved', async () => {
      const report = { idReport: 1, status: 'pending' };
      reportRepo.findOne.mockResolvedValue(report);
      reportRepo.save.mockResolvedValue({ ...report, status: 'resolved' });

      const result = await service.resolveReport(1, 42, 'resolved', 'Done');

      expect(result.status).toBe('resolved');
    });

    it('should throw NotFoundException for missing report', async () => {
      reportRepo.findOne.mockResolvedValue(null);

      await expect(service.resolveReport(999, 42, 'resolved')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReportStats()', () => {
    it('should return correct statistics', async () => {
      reportRepo.count
        .mockResolvedValueOnce(5) // pending
        .mockResolvedValueOnce(10) // resolved
        .mockResolvedValueOnce(2); // rejected

      const stats = await service.getReportStats();

      expect(stats).toEqual({
        pending: 5,
        resolved: 10,
        rejected: 2,
        total: 17,
      });
    });
  });

  // ─── findByTopic() ────────────────────────────────────────────

  describe('findByTopic()', () => {
    it('should return messages for a topic', async () => {
      const messages = [
        { idForumMessage: 1, content: 'first' },
        { idForumMessage: 2, content: 'second' },
      ];
      messageRepo.find.mockResolvedValue(messages);

      const result = await service.findByTopic(1);
      expect(result).toHaveLength(2);
    });
  });
});
