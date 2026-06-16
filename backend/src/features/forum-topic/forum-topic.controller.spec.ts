import { Test, TestingModule } from '@nestjs/testing';
import { ForumTopicController } from './forum-topic.controller';
import { ForumTopicService } from './forum-topic.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  lockTopic: jest.fn(),
  pinTopic: jest.fn(),
  moderatorRemove: jest.fn(),
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
      service.create.mockResolvedValue(topic);

      const result = await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
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

  // ─── findOne ───────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a single topic', async () => {
      service.findOne.mockResolvedValue({ idForumTopic: 5 });

      const result = await controller.findOne('5');
      expect(service.findOne).toHaveBeenCalledWith(5);
      expect(result.idForumTopic).toBe(5);
    });
  });

  // ─── update ────────────────────────────────────────────────────

  describe('update()', () => {
    it('should delegate to service.update', async () => {
      const dto = { title: 'Updated' };
      service.update.mockResolvedValue({ idForumTopic: 1, title: 'Updated' });

      const result = await controller.update('1', dto as any);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.title).toBe('Updated');
    });
  });

  // ─── remove ────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should delegate to service.remove', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('3');
      expect(service.remove).toHaveBeenCalledWith(3);
    });
  });

  // ─── lockTopic ─────────────────────────────────────────────────

  describe('lockTopic()', () => {
    it('should toggle lock', async () => {
      service.lockTopic.mockResolvedValue({ idForumTopic: 1, isLocked: true });

      const result = await controller.lockTopic('1');
      expect(service.lockTopic).toHaveBeenCalledWith(1);
      expect(result.isLocked).toBe(true);
    });
  });

  // ─── pinTopic ──────────────────────────────────────────────────

  describe('pinTopic()', () => {
    it('should toggle pin', async () => {
      service.pinTopic.mockResolvedValue({ idForumTopic: 1, isPinned: true });

      const result = await controller.pinTopic('1');
      expect(service.pinTopic).toHaveBeenCalledWith(1);
      expect(result.isPinned).toBe(true);
    });
  });

  // ─── moderatorRemove ──────────────────────────────────────────

  describe('moderatorRemove()', () => {
    it('should delegate to service.moderatorRemove', async () => {
      service.moderatorRemove.mockResolvedValue(undefined);

      await controller.moderatorRemove('7');
      expect(service.moderatorRemove).toHaveBeenCalledWith(7);
    });
  });
});
