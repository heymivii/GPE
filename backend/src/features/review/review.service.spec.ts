import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { User } from '../user/entities/user.entity';
import { NotificationService } from '../notification/notification.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
});

describe('ReviewService', () => {
  let service: ReviewService;
  let userRepo: any;
  let notifications: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        { provide: NotificationService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    userRepo = module.get(getRepositoryToken(User));
    notifications = module.get(NotificationService);
    notifications.create.mockResolvedValue(undefined as any);
  });

  describe('assertNotSelfReview', () => {
    it('throws ForbiddenException when the reviewer is the author', () => {
      expect(() => service.assertNotSelfReview(1, 1)).toThrow(
        ForbiddenException,
      );
    });

    it('does not throw when reviewer and author differ', () => {
      expect(() => service.assertNotSelfReview(1, 2)).not.toThrow();
    });

    it('does not throw when there is no known author', () => {
      expect(() => service.assertNotSelfReview(null, 2)).not.toThrow();
      expect(() => service.assertNotSelfReview(undefined, 2)).not.toThrow();
    });
  });

  describe('notifyAdminsOfPending', () => {
    it('notifies every admin except the author', async () => {
      userRepo.find.mockResolvedValue([
        { idUser: 1, firstName: 'Ann', lastName: 'A' },
        { idUser: 2, firstName: 'Bob', lastName: 'B' },
        { idUser: 3, firstName: 'Cid', lastName: 'C' },
      ]);
      userRepo.findOne.mockResolvedValue({
        idUser: 1,
        firstName: 'Ann',
        lastName: 'A',
      });

      await service.notifyAdminsOfPending('Pays « Canada »', 1);

      expect(notifications.create).toHaveBeenCalledTimes(2);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 2,
          notificationType: 'alert',
          message: expect.stringContaining('Pays « Canada »'),
        }),
      );
      expect(notifications.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1 }),
      );
    });

    it('swallows errors instead of throwing', async () => {
      userRepo.find.mockRejectedValue(new Error('db down'));
      await expect(
        service.notifyAdminsOfPending('Pays « Canada »', 1),
      ).resolves.toBeUndefined();
    });
  });

  describe('notifyAdminsOfAddition', () => {
    it('notifies every admin except the author with an info message', async () => {
      userRepo.find.mockResolvedValue([{ idUser: 1 }, { idUser: 2 }]);
      userRepo.findOne.mockResolvedValue(null);

      await service.notifyAdminsOfAddition('Ville « Lyon »', 1);

      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 2, notificationType: 'info' }),
      );
    });

    it('swallows notification errors', async () => {
      userRepo.find.mockResolvedValue([{ idUser: 2 }]);
      userRepo.findOne.mockResolvedValue(null);
      notifications.create.mockRejectedValue(new Error('notif down'));

      await expect(
        service.notifyAdminsOfAddition('Ville « Lyon »', 1),
      ).resolves.toBeUndefined();
    });
  });

  describe('notifyAuthorOfDecision', () => {
    it('does nothing when there is no author', async () => {
      await service.notifyAuthorOfDecision('X', null, true, 2);
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('sends an approval message with the reviewer name', async () => {
      userRepo.findOne.mockResolvedValue({
        idUser: 2,
        firstName: 'Rev',
        lastName: 'Iewer',
      });

      await service.notifyAuthorOfDecision('Pays « Canada »', 1, true, 2);

      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          message: expect.stringContaining('✅'),
        }),
      );
    });

    it('sends a rejection message with the reviewer name', async () => {
      userRepo.findOne.mockResolvedValue({
        idUser: 2,
        firstName: 'Rev',
        lastName: 'Iewer',
      });

      await service.notifyAuthorOfDecision('Pays « Canada »', 1, false, 2);

      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          message: expect.stringContaining('❌'),
        }),
      );
    });

    it('swallows notification errors', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 2 });
      notifications.create.mockRejectedValue(new Error('notif down'));

      await expect(
        service.notifyAuthorOfDecision('X', 1, true, 2),
      ).resolves.toBeUndefined();
    });
  });

  describe('notifyUser', () => {
    it('does nothing when userId is null', async () => {
      await service.notifyUser(null, 'hello');
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('sends the message with the given type, defaulting to info', async () => {
      await service.notifyUser(1, 'hello');
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          message: 'hello',
          notificationType: 'info',
        }),
      );
    });

    it('swallows notification errors', async () => {
      notifications.create.mockRejectedValue(new Error('notif down'));
      await expect(service.notifyUser(1, 'hello')).resolves.toBeUndefined();
    });
  });

  describe('nameOf / displayName', () => {
    it('returns a generic label when userId is null', async () => {
      const result = await service.nameOf(null);
      expect(result).toBe('un admin');
    });

    it('returns the full name when available', async () => {
      userRepo.findOne.mockResolvedValue({ firstName: 'Ann', lastName: 'A' });
      const result = await service.nameOf(1);
      expect(result).toBe('Ann A');
    });

    it('falls back to the email when there is no name', async () => {
      userRepo.findOne.mockResolvedValue({
        firstName: null,
        lastName: null,
        email: 'ann@a.com',
      });
      const result = await service.nameOf(1);
      expect(result).toBe('ann@a.com');
    });

    it('falls back to a generic label when the user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.nameOf(999);
      expect(result).toBe('un admin');
    });
  });
});
