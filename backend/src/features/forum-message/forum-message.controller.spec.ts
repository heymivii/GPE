import { Test, TestingModule } from '@nestjs/testing';
import { ForumMessageController } from './forum-message.controller';
import { ForumMessageService } from './forum-message.service';
import { SupportRatingService } from '../support-rating/support-rating.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByTopic: jest.fn(),
  findOne: jest.fn(),
  findOnePublic: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  moderatorRemove: jest.fn(),
  createReport: jest.fn(),
  findAllReports: jest.fn(),
  getReportStats: jest.fn(),
  resolveReport: jest.fn(),
});

describe('ForumMessageController', () => {
  let controller: ForumMessageController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumMessageController],
      providers: [
        { provide: ForumMessageService, useValue: service },
        {
          provide: SupportRatingService,
          useValue: {
            rate: jest.fn(),
            unrate: jest.fn(),
            getMyRatingsForTopic: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ForumMessageController>(ForumMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── create ────────────────────────────────────────────────────

  describe('create()', () => {
    it('should delegate to service.create', async () => {
      const dto = { content: 'Hello', idForumMessage: 1, topicId: 1 };
      const req = { user: { userId: 1 } };
      service.create.mockResolvedValue({ idForumMessage: 1, content: 'Hello' });

      const result = await controller.create(req, dto as any);
      expect(service.create).toHaveBeenCalledWith(1, dto);
      expect(result.idForumMessage).toBe(1);
    });
  });

  // ─── findAll ───────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return all messages when no topicId', async () => {
      service.findAll.mockResolvedValue([{ idForumMessage: 1 }]);

      const result = await controller.findAll(undefined);
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should filter by topicId when provided', async () => {
      service.findByTopic.mockResolvedValue([{ idForumMessage: 2 }]);

      const result = await controller.findAll('5');
      expect(service.findByTopic).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a single message', async () => {
      service.findOnePublic.mockResolvedValue({ idForumMessage: 3 });

      const result = await controller.findOne(3);
      expect(service.findOnePublic).toHaveBeenCalledWith(3);
      expect(result.idForumMessage).toBe(3);
    });
  });

  // ─── update ────────────────────────────────────────────────────

  describe('update()', () => {
    it('should delegate to service.update', async () => {
      const dto = { content: 'Updated content' };
      const req = { user: { userId: 1 } };
      service.update.mockResolvedValue({
        idForumMessage: 1,
        content: 'Updated content',
      });

      const result = await controller.update(req, 1, dto as any);
      expect(service.update).toHaveBeenCalledWith(1, 1, dto);
      expect(result.content).toBe('Updated content');
    });
  });

  // ─── remove ────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should delegate to service.remove', async () => {
      const req = { user: { userId: 1 } };
      service.remove.mockResolvedValue(undefined);

      await controller.remove(req, 4);
      expect(service.remove).toHaveBeenCalledWith(4, 1);
    });
  });

  // ─── moderateRemove ────────────────────────────────────────────

  describe('moderateRemove()', () => {
    it('should delegate to service.moderatorRemove', async () => {
      service.moderatorRemove.mockResolvedValue(undefined);

      await controller.moderateRemove(6);
      expect(service.moderatorRemove).toHaveBeenCalledWith(6);
    });
  });

  // ─── createReport ─────────────────────────────────────────────

  describe('createReport()', () => {
    it('should delegate to service.createReport', async () => {
      const dto = {
        messageId: 2,
        reason: 'spam',
        itemType: 'message',
      };
      const req = { user: { userId: 1 } };
      service.createReport.mockResolvedValue({ idReport: 1 });

      const result = await controller.createReport(req, dto as any);
      expect(service.createReport).toHaveBeenCalledWith(1, dto);
      expect(result.idReport).toBe(1);
    });
  });

  // ─── findAllReports ────────────────────────────────────────────

  describe('findAllReports()', () => {
    it('should return all reports', async () => {
      service.findAllReports.mockResolvedValue([{ report_id: 1 }]);

      const result = await controller.findAllReports(undefined);
      expect(service.findAllReports).toHaveBeenCalledWith(undefined);
      expect(result).toHaveLength(1);
    });

    it('should filter by status', async () => {
      service.findAllReports.mockResolvedValue([]);

      const result = await controller.findAllReports('pending');
      expect(service.findAllReports).toHaveBeenCalledWith('pending');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getReportStats ────────────────────────────────────────────

  describe('getReportStats()', () => {
    it('should return report statistics', async () => {
      const stats = { pending: 3, resolved: 10, rejected: 2, total: 15 };
      service.getReportStats.mockResolvedValue(stats);

      const result = await controller.getReportStats();
      expect(result.total).toBe(15);
    });
  });

  // ─── resolveReport ─────────────────────────────────────────────

  describe('resolveReport()', () => {
    it('should resolve a report', async () => {
      const req = { user: { userId: 42 } };
      const body = { action: 'resolved' as const, moderatorNote: 'done' };
      service.resolveReport.mockResolvedValue({
        report_id: 1,
        status: 'resolved',
      });

      const result = await controller.resolveReport(1, req, body);
      expect(service.resolveReport).toHaveBeenCalledWith(
        1,
        42,
        'resolved',
        'done',
      );
      expect(result.status).toBe('resolved');
    });

    it('should reject a report', async () => {
      const req = { user: { userId: 42 } };
      const body = { action: 'rejected' as const };
      service.resolveReport.mockResolvedValue({
        report_id: 1,
        status: 'rejected',
      });

      const result = await controller.resolveReport(1, req, body);
      expect(service.resolveReport).toHaveBeenCalledWith(
        1,
        42,
        'rejected',
        undefined,
      );
      expect(result.status).toBe('rejected');
    });
  });
});
