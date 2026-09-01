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

    it('returns the notification when it belongs to the requester', async () => {
      repo.findOne.mockResolvedValue({
        idNotification: 1,
        user: { idUser: 7 },
      });
      const result = await service.findOne(1, 7);
      expect(result.idNotification).toBe(1);
    });
  });

  describe('findAllByUser', () => {
    it('returns notifications ordered by sentAt DESC', async () => {
      repo.find.mockResolvedValue([{ idNotification: 1 }]);
      const result = await service.findAllByUser(7);
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith({
        where: { user: { idUser: 7 } },
        order: { sentAt: 'DESC' },
      });
    });
  });

  describe('markAsRead', () => {
    it('flips isRead and saves the notification', async () => {
      const notification = { idNotification: 1, user: { idUser: 7 }, isRead: false };
      repo.findOne.mockResolvedValue(notification);
      repo.save.mockImplementation(async (n: any) => n);

      const result = await service.markAsRead(1, 7);

      expect(result.isRead).toBe(true);
    });
  });

  describe('update', () => {
    it('refuses to update another user’s notification', async () => {
      repo.findOne.mockResolvedValue({ idNotification: 1, user: { idUser: 99 } });
      await expect(
        service.update(1, 7, { message: 'hi' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('merges the dto into the notification and saves it', async () => {
      const notification = {
        idNotification: 1,
        user: { idUser: 7 },
        message: 'old',
      };
      repo.findOne.mockResolvedValue(notification);
      repo.save.mockImplementation(async (n: any) => n);

      const result = await service.update(1, 7, { message: 'new' } as any);

      expect(result.message).toBe('new');
    });
  });

  describe('remove', () => {
    it('refuses to remove another user’s notification', async () => {
      repo.findOne.mockResolvedValue({ idNotification: 1, user: { idUser: 99 } });
      await expect(service.remove(1, 7)).rejects.toThrow(ForbiddenException);
    });

    it('removes the notification when owned by the requester', async () => {
      const notification = { idNotification: 1, user: { idUser: 7 } };
      repo.findOne.mockResolvedValue(notification);

      await service.remove(1, 7);

      expect(repo.remove).toHaveBeenCalledWith(notification);
    });
  });
});
