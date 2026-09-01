import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ForumModerationService } from './forum-moderation.service';
import { ForbiddenWord } from './entities/forbidden-word.entity';
import { UserWarning } from './entities/user-warning.entity';
import { User } from '../user/entities/user.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  increment: jest.fn(),
});

describe('ForumModerationService', () => {
  let service: ForumModerationService;
  let wordRepo: any;
  let warningRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumModerationService,
        { provide: getRepositoryToken(ForbiddenWord), useFactory: mockRepo },
        { provide: getRepositoryToken(UserWarning), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<ForumModerationService>(ForumModerationService);
    wordRepo = module.get(getRepositoryToken(ForbiddenWord));
    warningRepo = module.get(getRepositoryToken(UserWarning));
    userRepo = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  describe('createWord', () => {
    it('trims and lowercases the word, defaults severity/isActive', async () => {
      wordRepo.create.mockImplementation((w: any) => w);
      wordRepo.save.mockImplementation((w: any) => Promise.resolve(w));
      const result = await service.createWord({ word: '  Con  ' } as any);
      expect(result.word).toBe('con');
      expect(result.severity).toBe('medium');
      expect(result.isActive).toBe(true);
    });
  });

  describe('listWords', () => {
    it('returns all words ordered by word ASC', async () => {
      wordRepo.find.mockResolvedValue([{ idForbiddenWord: 1, word: 'con' }]);
      const result = await service.listWords();
      expect(wordRepo.find).toHaveBeenCalledWith({ order: { word: 'ASC' } });
      expect(result).toEqual([{ idForbiddenWord: 1, word: 'con' }]);
    });
  });

  describe('updateWord', () => {
    it('throws NotFoundException when word does not exist', async () => {
      wordRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateWord(999, { word: 'x' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates provided fields only', async () => {
      const word = {
        idForbiddenWord: 1,
        word: 'old',
        severity: 'medium',
        isActive: true,
      };
      wordRepo.findOne.mockResolvedValue(word);
      wordRepo.save.mockImplementation((w: any) => Promise.resolve(w));
      const result = await service.updateWord(1, { isActive: false } as any);
      expect(result.isActive).toBe(false);
      expect(result.word).toBe('old');
    });
  });

  describe('removeWord', () => {
    it('throws NotFoundException when nothing was deleted', async () => {
      wordRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.removeWord(999)).rejects.toThrow(NotFoundException);
    });

    it('resolves when a word was deleted', async () => {
      wordRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.removeWord(1)).resolves.toBeUndefined();
    });
  });

  describe('moderate', () => {
    it('returns ok when there are no active forbidden words', async () => {
      wordRepo.find.mockResolvedValue([]);
      const result = await service.moderate(1, "n'importe quel texte");
      expect(result).toEqual({ action: 'ok' });
      expect(warningRepo.save).not.toHaveBeenCalled();
    });

    it('returns ok when text does not match any forbidden word', async () => {
      wordRepo.find.mockResolvedValue([
        { idForbiddenWord: 1, word: 'interdit', severity: 'high' },
      ]);
      const result = await service.moderate(1, 'un texte tout à fait correct');
      expect(result).toEqual({ action: 'ok' });
    });

    it('flags on low/medium severity match and records a warning', async () => {
      wordRepo.find.mockResolvedValue([
        { idForbiddenWord: 1, word: 'moche', severity: 'low' },
      ]);
      warningRepo.create.mockImplementation((w: any) => w);
      warningRepo.save.mockResolvedValue(undefined);

      const result = await service.moderate(42, "c'est moche");

      expect(result.action).toBe('flag');
      expect(result.reason).toContain('moche');
      expect(warningRepo.save).toHaveBeenCalled();
      expect(userRepo.increment).toHaveBeenCalledWith(
        { idUser: 42 },
        'warningCount',
        1,
      );
    });

    it('blocks on high/critical severity match', async () => {
      wordRepo.find.mockResolvedValue([
        { idForbiddenWord: 2, word: 'insulte', severity: 'critical' },
      ]);
      warningRepo.create.mockImplementation((w: any) => w);
      warningRepo.save.mockResolvedValue(undefined);

      const result = await service.moderate(1, 'une insulte grave');

      expect(result.action).toBe('block');
    });

    it('matches regardless of case and accents', async () => {
      wordRepo.find.mockResolvedValue([
        { idForbiddenWord: 1, word: 'côn', severity: 'high' },
      ]);
      warningRepo.create.mockImplementation((w: any) => w);
      warningRepo.save.mockResolvedValue(undefined);

      const result = await service.moderate(1, 'espèce de CON');

      expect(result.action).toBe('block');
    });

    it('does not match substrings inside other words (word boundary)', async () => {
      wordRepo.find.mockResolvedValue([
        { idForbiddenWord: 1, word: 'con', severity: 'high' },
      ]);
      const result = await service.moderate(1, 'un concept intéressant');
      expect(result.action).toBe('ok');
    });

    it('picks the worst severity when multiple words match', async () => {
      wordRepo.find.mockResolvedValue([
        { idForbiddenWord: 1, word: 'bete', severity: 'low' },
        { idForbiddenWord: 2, word: 'idiot', severity: 'critical' },
      ]);
      warningRepo.create.mockImplementation((w: any) => w);
      warningRepo.save.mockResolvedValue(undefined);

      const result = await service.moderate(1, 'tu es bete et idiot');

      expect(result.action).toBe('block');
      expect(result.reason).toContain('idiot');
    });
  });

  describe('listFlaggedUsers', () => {
    it('uses the default threshold when none is provided', async () => {
      userRepo.find.mockResolvedValue([]);
      await service.listFlaggedUsers();
      expect(userRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { warningCount: 'DESC' },
        }),
      );
    });
  });

  describe('listUserWarnings', () => {
    it('returns warnings for a given user', async () => {
      warningRepo.find.mockResolvedValue([{ idUserWarning: 1 }]);
      const result = await service.listUserWarnings(7);
      expect(result).toHaveLength(1);
      expect(warningRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user: { idUser: 7 } } }),
      );
    });
  });
});
