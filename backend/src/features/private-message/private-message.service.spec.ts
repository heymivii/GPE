import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrivateMessageService } from './private-message.service';
import { PrivateMessage } from './entities/private-message.entity';
import { User } from '../user/entities/user.entity';
import { ContentFilterService } from '../forum-message/content-filter.service';
import { ForumModerationService } from '../forum-moderation/forum-moderation.service';
import { BuddyContactRequest } from '../buddy-contact/entities/buddy-contact-request.entity';

const mockRepo = () => ({
  create: jest.fn((v) => v),
  save: jest.fn((v) => Promise.resolve(v)),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
});

const mockUserRepo = () => ({ findOne: jest.fn() });

const mockContentFilter = () => ({
  sanitize: jest.fn((c: string) => c.trim()),
  validate: jest.fn(async () => ({ ok: true }) as { ok: boolean; reason?: string }),
});

const mockModeration = () => ({
  moderate: jest.fn(async () => ({ action: 'ok' }) as { action: string; reason?: string }),
});

describe('PrivateMessageService', () => {
  let service: PrivateMessageService;
  let repo: ReturnType<typeof mockRepo>;
  let userRepo: ReturnType<typeof mockUserRepo>;
  let buddyRequestRepo: { find: jest.Mock };
  let contentFilter: ReturnType<typeof mockContentFilter>;
  let moderation: ReturnType<typeof mockModeration>;

  beforeEach(async () => {
    repo = mockRepo();
    userRepo = mockUserRepo();
    buddyRequestRepo = { find: jest.fn().mockResolvedValue([]) };
    contentFilter = mockContentFilter();
    moderation = mockModeration();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrivateMessageService,
        { provide: getRepositoryToken(PrivateMessage), useValue: repo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(BuddyContactRequest), useValue: buddyRequestRepo },
        { provide: ContentFilterService, useValue: contentFilter },
        { provide: ForumModerationService, useValue: moderation },
      ],
    }).compile();

    service = module.get<PrivateMessageService>(PrivateMessageService);
  });

  describe('send()', () => {
    it('sends a sanitized message to a valid recipient', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 2 });
      await service.send(1, 2, '  hello  ');
      expect(contentFilter.validate).toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ senderId: 1, recipientId: 2, content: 'hello' }),
      );
    });

    it('rejects writing to yourself (400)', async () => {
      await expect(service.send(1, 1, 'hi')).rejects.toThrow(BadRequestException);
    });

    it('404 when the recipient does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.send(1, 999, 'hi')).rejects.toThrow(NotFoundException);
    });

    it('rejects content the filter refuses (400)', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 2 });
      contentFilter.validate.mockResolvedValue({ ok: false, reason: 'spam' });
      await expect(service.send(1, 2, 'buy now')).rejects.toThrow(BadRequestException);
    });
  });

  describe('markRead() — sécurité', () => {
    it('lets the RECIPIENT mark a message as read', async () => {
      repo.findOne.mockResolvedValue({
        idPrivateMessage: 5,
        recipientId: 1,
        readAt: null,
      });
      const res = await service.markRead(5, 1);
      expect(res.readAt).toBeInstanceOf(Date);
    });

    it('FORBIDS anyone who is not the recipient (403) — point critique', async () => {
      // Message destiné à l'utilisateur 1 ; l'utilisateur 9 tente de le marquer lu.
      repo.findOne.mockResolvedValue({
        idPrivateMessage: 5,
        recipientId: 1,
        senderId: 2,
        readAt: null,
      });
      await expect(service.markRead(5, 9)).rejects.toThrow(ForbiddenException);
    });

    it('404 for a missing message', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.markRead(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getThread()', () => {
    it('returns the pair’s messages and marks the received ones as read', async () => {
      repo.find.mockResolvedValue([
        { idPrivateMessage: 1, senderId: 1, recipientId: 2, readAt: null },
        { idPrivateMessage: 2, senderId: 2, recipientId: 1, readAt: null },
      ]);
      const res = await service.getThread(1, 2);
      // Le message reçu (id 2, recipient=1) est marqué lu ; pas le mien (id 1).
      expect(repo.update).toHaveBeenCalledWith([2], { readAt: expect.any(Date) });
      expect(res[0].mine).toBe(true);
      expect(res[1].mine).toBe(false);
    });
  });

  describe('getConversations()', () => {
    it('groups by interlocutor with last message + unread count, never exposes email', async () => {
      repo.find.mockResolvedValue([
        {
          senderId: 2, recipientId: 1, content: 'latest', sentAt: new Date('2026-02-02'),
          readAt: null, sender: { idUser: 2, firstName: 'Bob', email: 'bob@x.com' }, recipient: { idUser: 1 },
        },
        {
          senderId: 1, recipientId: 2, content: 'older', sentAt: new Date('2026-02-01'),
          readAt: new Date(), sender: { idUser: 1 }, recipient: { idUser: 2, firstName: 'Bob', email: 'bob@x.com' },
        },
      ]);
      const res = await service.getConversations(1);
      expect(res).toHaveLength(1);
      expect(res[0]).toEqual(
        expect.objectContaining({ userId: 2, fullName: 'Bob', lastMessage: 'latest', unread: 1 }),
      );
      expect((res[0] as any).email).toBeUndefined();
    });

    it('flags verified experts and lists accepted buddy topics per interlocutor', async () => {
      repo.find.mockResolvedValue([
        {
          senderId: 2, recipientId: 1, content: 'salut', sentAt: new Date('2026-02-02'),
          readAt: null,
          sender: { idUser: 2, firstName: 'Eve', isExpert: true, expertVerifiedAt: new Date(), expertTitle: 'Avocate' },
          recipient: { idUser: 1 },
        },
        {
          senderId: 3, recipientId: 1, content: 'hello', sentAt: new Date('2026-02-01'),
          readAt: null,
          sender: { idUser: 3, firstName: 'Marie', isExpert: true, expertVerifiedAt: null },
          recipient: { idUser: 1 },
        },
      ]);
      buddyRequestRepo.find.mockResolvedValue([
        {
          status: 'accepted',
          sender: { idUser: 1 },
          recipient: { idUser: 3 },
          procedure: { procedureType: 'Assurance maladie & santé' },
        },
        {
          status: 'accepted',
          sender: { idUser: 3 },
          recipient: { idUser: 1 },
          procedure: { procedureType: 'Compte bancaire' },
        },
      ]);

      const res = await service.getConversations(1);
      const eve = res.find((c) => c.userId === 2)!;
      const marie = res.find((c) => c.userId === 3)!;

      expect(eve.isExpert).toBe(true);
      expect(eve.expertTitle).toBe('Avocate');
      expect(eve.buddyTopics).toEqual([]);
      // isExpert sans expertVerifiedAt = PAS un expert vérifié.
      expect(marie.isExpert).toBe(false);
      // Sujets buddy dans les deux sens de la demande acceptée.
      expect(marie.buddyTopics).toEqual(['Assurance maladie & santé', 'Compte bancaire']);
    });
  });

  describe('send() — modération', () => {
    it('rejects a message containing an admin forbidden word', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 2 });
      moderation.moderate.mockResolvedValue({ action: 'block', reason: 'Terme signalé « x »' });
      await expect(service.send(1, 2, 'gros mot')).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCount()', () => {
    it('counts unread messages for the user', async () => {
      repo.count.mockResolvedValue(3);
      expect(await service.getUnreadCount(1)).toEqual({ count: 3 });
    });
  });
});
