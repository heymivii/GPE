import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BuddyContactService } from './buddy-contact.service';
import { BuddyContactRequest } from './entities/buddy-contact-request.entity';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';
import { NotificationService } from '../notification/notification.service';

const mockQueryBuilder = () => ({
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(undefined),
});

describe('BuddyContactService', () => {
  let service: BuddyContactService;
  let requestRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let procedureRepo: { findOne: jest.Mock };
  let notificationService: { create: jest.Mock };
  let queryBuilder: ReturnType<typeof mockQueryBuilder>;

  beforeEach(async () => {
    queryBuilder = mockQueryBuilder();
    requestRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (entity) => ({ id: 1, ...entity })),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    procedureRepo = { findOne: jest.fn() };
    notificationService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuddyContactService,
        { provide: getRepositoryToken(BuddyContactRequest), useValue: requestRepo },
        { provide: getRepositoryToken(AdminProcedure), useValue: procedureRepo },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<BuddyContactService>(BuddyContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendRequest()', () => {
    it('rejects contacting oneself', async () => {
      await expect(service.sendRequest(1, 1, 5)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(requestRepo.save).not.toHaveBeenCalled();
    });

    it('rejects a duplicate pending request for the same procedure', async () => {
      requestRepo.findOne.mockResolvedValue({ id: 9, status: 'pending' });
      await expect(service.sendRequest(1, 2, 5)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(requestRepo.save).not.toHaveBeenCalled();
    });

    it('creates the request, sets a 7-day expiry, and notifies the recipient with a clickable context', async () => {
      requestRepo.findOne.mockResolvedValue(null);
      procedureRepo.findOne.mockResolvedValue({
        idAdminProcedure: 5,
        procedureType: 'Visa long séjour',
      });

      const before = Date.now();
      const result = await service.sendRequest(1, 2, 5, 'Salut !');
      const after = Date.now();

      expect(requestRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sender: { idUser: 1 },
          recipient: { idUser: 2 },
          procedure: { idAdminProcedure: 5 },
          message: 'Salut !',
          status: 'pending',
        }),
      );
      const expiresAt = (requestRepo.create.mock.calls[0][0] as any)
        .expiresAt as Date;
      expect(expiresAt.getTime()).toBeGreaterThan(before + 6 * 24 * 3600 * 1000);
      expect(expiresAt.getTime()).toBeLessThan(after + 8 * 24 * 3600 * 1000);

      expect(notificationService.create).toHaveBeenCalledWith({
        userId: 2,
        notificationType: 'message',
        message: expect.stringContaining('Visa long séjour'),
        contextType: 'buddy-request',
        contextId: result.id,
      });
    });

    it('defaults message to null when omitted', async () => {
      requestRepo.findOne.mockResolvedValue(null);
      procedureRepo.findOne.mockResolvedValue(null);

      await service.sendRequest(1, 2, 5);

      expect(requestRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ message: null }),
      );
    });
  });

  describe('respondToRequest()', () => {
    const pendingRequest = (overrides: any = {}) => ({
      id: 6,
      status: 'pending',
      senderId: 1,
      recipientId: 2,
      expiresAt: new Date(Date.now() + 3600_000),
      procedure: { procedureType: 'Visa long séjour' },
      ...overrides,
    });

    it('throws NotFoundException when the request does not exist', async () => {
      requestRepo.findOne.mockResolvedValue(null);
      await expect(
        service.respondToRequest(6, 2, true),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when the responder is not the recipient', async () => {
      requestRepo.findOne.mockResolvedValue(pendingRequest());
      await expect(
        service.respondToRequest(6, 999, true),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException when the request was already answered', async () => {
      requestRepo.findOne.mockResolvedValue(pendingRequest({ status: 'accepted' }));
      await expect(
        service.respondToRequest(6, 2, true),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('marks an overdue request as expired and rejects the response', async () => {
      const expired = pendingRequest({ expiresAt: new Date(Date.now() - 1000) });
      requestRepo.findOne.mockResolvedValue(expired);

      await expect(
        service.respondToRequest(6, 2, true),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(requestRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'expired' }),
      );
    });

    it('accepts the request and notifies the sender with a link to the recipient', async () => {
      requestRepo.findOne.mockResolvedValue(pendingRequest());

      const result = await service.respondToRequest(6, 2, true);

      expect(result.status).toBe('accepted');
      expect(requestRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'accepted' }),
      );
      expect(notificationService.create).toHaveBeenCalledWith({
        userId: 1,
        notificationType: 'message',
        message: expect.stringContaining('acceptee'),
        contextType: 'user',
        contextId: 2,
      });
    });

    it('declines the request and notifies the sender without a clickable context', async () => {
      requestRepo.findOne.mockResolvedValue(pendingRequest());

      const result = await service.respondToRequest(6, 2, false);

      expect(result.status).toBe('declined');
      expect(notificationService.create).toHaveBeenCalledWith({
        userId: 1,
        notificationType: 'message',
        message: expect.stringContaining('disponible'),
      });
      const notifPayload = notificationService.create.mock.calls[0][0];
      expect(notifPayload.contextType).toBeUndefined();
      expect(notifPayload.contextId).toBeUndefined();
    });
  });

  describe('getMyRequests()', () => {
    it('expires stale pending requests before returning the list', async () => {
      requestRepo.find.mockResolvedValue([]);

      await service.getMyRequests(2);

      expect(requestRepo.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.update).toHaveBeenCalledWith(BuddyContactRequest);
      expect(queryBuilder.set).toHaveBeenCalledWith({ status: 'expired' });
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('returns requests where the user is either sender or recipient, most recent first', async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      requestRepo.find.mockResolvedValue(rows);

      const result = await service.getMyRequests(2);

      expect(requestRepo.find).toHaveBeenCalledWith({
        where: [{ recipient: { idUser: 2 } }, { sender: { idUser: 2 } }],
        relations: ['sender', 'recipient', 'procedure'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(rows);
    });
  });
});
