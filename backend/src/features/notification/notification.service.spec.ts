import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn((v) => v),
      save: jest.fn((v) => Promise.resolve({ idNotification: 1, ...v })),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: repo },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('persists the clickable context (type + id)', async () => {
      await service.create({
        userId: 7,
        message: '⏰ J-5',
        notificationType: 'reminder' as any,
        contextType: 'project',
        contextId: 42,
      });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          notifType: 'reminder',
          contextType: 'project',
          contextId: 42,
        }),
      );
    });

    it('defaults type to info and context to null when omitted', async () => {
      await service.create({ userId: 7, message: 'hello' });
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          notifType: 'info',
          contextType: null,
          contextId: null,
        }),
      );
    });
  });

  describe('markAllAsRead', () => {
    it('flips every unread notification of the user and returns the count', async () => {
      repo.update.mockResolvedValue({ affected: 3 });
      const res = await service.markAllAsRead(7);
      expect(repo.update).toHaveBeenCalledWith(
        { user: { idUser: 7 }, isRead: false },
        { isRead: true },
      );
      expect(res).toEqual({ updated: 3 });
    });

    it('reports 0 when nothing was unread', async () => {
      repo.update.mockResolvedValue({ affected: 0 });
      expect(await service.markAllAsRead(7)).toEqual({ updated: 0 });
    });
  });

  describe('ownership (anti-IDOR)', () => {
    it('refuses to read another user’s notification', async () => {
      repo.findOne.mockResolvedValue({ idNotification: 1, user: { idUser: 99 } });
      await expect(service.markAsRead(1, 7)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFound for a missing notification', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(123, 7)).rejects.toThrow(NotFoundException);
    });
  });
});
