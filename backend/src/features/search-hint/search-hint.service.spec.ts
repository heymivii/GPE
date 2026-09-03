import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SearchHintService } from './search-hint.service';
import { SearchHint } from './entities/search-hint.entity';
import { SEARCH_HINTS_SEED } from './search-hints.seed';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('SearchHintService', () => {
  let service: SearchHintService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchHintService,
        { provide: getRepositoryToken(SearchHint), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<SearchHintService>(SearchHintService);
    repo = module.get(getRepositoryToken(SearchHint));
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('uppercases the country code filter', async () => {
      repo.find.mockResolvedValue([]);
      await service.list({ countryCode: 'fr', category: 'visa' });
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { countryCode: 'FR', category: 'visa' },
        }),
      );
    });

    it('uses an empty filter when nothing is provided', async () => {
      repo.find.mockResolvedValue([]);
      await service.list();
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when no hint matches', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('fr', 'visa')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the matching hint', async () => {
      const hint = { countryCode: 'FR', category: 'visa' };
      repo.findOne.mockResolvedValue(hint);
      const result = await service.findOne('fr', 'visa');
      expect(result).toEqual(hint);
    });
  });

  describe('findOneOrNull', () => {
    it('returns null instead of throwing when nothing matches', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findOneOrNull('fr', 'visa');
      expect(result).toBeNull();
    });

    it('uppercases the country code before querying', async () => {
      repo.findOne.mockResolvedValue(null);
      await service.findOneOrNull('fr', 'visa');
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { countryCode: 'FR', category: 'visa' },
      });
    });
  });

  describe('create', () => {
    it('throws ConflictException when a hint already exists for the combo', async () => {
      repo.findOne.mockResolvedValue({ countryCode: 'FR', category: 'visa' });
      await expect(
        service.create({ countryCode: 'fr', category: 'visa' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('applies defaults for optional fields and uppercases the country code', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockImplementation((h: any) => h);
      repo.save.mockImplementation((h: any) => Promise.resolve(h));

      const result = await service.create({
        countryCode: 'fr',
        category: 'visa',
      } as any);

      expect(result).toEqual({
        countryCode: 'FR',
        category: 'visa',
        officialDomains: [],
        keywords: '',
        queryLang: 'fr',
        excludeTerms: [],
        pinnedUrl: null,
      });
    });

    it('prefixe https:// sur une pinnedUrl collée sans schéma', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockImplementation((h: any) => h);
      repo.save.mockImplementation((h: any) => Promise.resolve(h));
      const result = await service.create({
        countryCode: 'fr',
        category: 'visa',
        keywords: 'visa',
        pinnedUrl: 'france-visas.gouv.fr/',
      } as any);
      expect(result.pinnedUrl).toBe('https://france-visas.gouv.fr/');
    });

    it('laisse intacte une pinnedUrl déjà schématisée et vide → null', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockImplementation((h: any) => h);
      repo.save.mockImplementation((h: any) => Promise.resolve(h));
      const withScheme = await service.create({
        countryCode: 'fr',
        category: 'visa',
        keywords: 'visa',
        pinnedUrl: 'http://example.gouv.fr',
      } as any);
      expect(withScheme.pinnedUrl).toBe('http://example.gouv.fr');
      const empty = await service.create({
        countryCode: 'fr',
        category: 'sante',
        keywords: 'x',
        pinnedUrl: '   ',
      } as any);
      expect(empty.pinnedUrl).toBeNull();
    });
  });

  describe('update — normalisation pinnedUrl', () => {
    it('prefixe https:// aussi à la mise à jour', async () => {
      repo.findOne.mockResolvedValue({ countryCode: 'FR', category: 'visa', pinnedUrl: null });
      repo.save.mockImplementation((h: any) => Promise.resolve(h));
      const result = await service.update('FR', 'visa', { pinnedUrl: 'france-visas.gouv.fr' } as any);
      expect(result.pinnedUrl).toBe('https://france-visas.gouv.fr');
    });
  });

  describe('update', () => {
    it('merges the dto into the existing hint', async () => {
      const hint = { countryCode: 'FR', category: 'visa', keywords: 'old' };
      repo.findOne.mockResolvedValue(hint);
      repo.save.mockImplementation((h: any) => Promise.resolve(h));

      const result = await service.update('fr', 'visa', {
        keywords: 'new',
      } as any);

      expect(result.keywords).toBe('new');
    });
  });

  describe('remove', () => {
    it('removes the hint when found', async () => {
      const hint = { countryCode: 'FR', category: 'visa' };
      repo.findOne.mockResolvedValue(hint);
      repo.remove.mockResolvedValue(undefined);
      await service.remove('fr', 'visa');
      expect(repo.remove).toHaveBeenCalledWith(hint);
    });

    it('throws NotFoundException when nothing to remove', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('fr', 'visa')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('seedMissing', () => {
    it('inserts every seed entry when the table is empty', async () => {
      repo.find.mockResolvedValue([]);
      repo.create.mockImplementation((h: any) => h);
      repo.save.mockResolvedValue(undefined);

      const result = await service.seedMissing();

      expect(result).toEqual({
        inserted: SEARCH_HINTS_SEED.length,
        skipped: 0,
        total: SEARCH_HINTS_SEED.length,
      });
      expect(repo.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ countryCode: expect.any(String) }),
        ]),
      );
    });

    it('is idempotent: a second run inserts nothing once all combos exist', async () => {
      const existing = SEARCH_HINTS_SEED.map((s) => ({
        countryCode: s.countryCode,
        category: s.category,
      }));
      repo.find.mockResolvedValue(existing);

      const result = await service.seedMissing();

      expect(result).toEqual({
        inserted: 0,
        skipped: SEARCH_HINTS_SEED.length,
        total: SEARCH_HINTS_SEED.length,
      });
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('only inserts combos that are still missing', async () => {
      const [first, ...rest] = SEARCH_HINTS_SEED;
      repo.find.mockResolvedValue([
        { countryCode: first.countryCode, category: first.category },
      ]);
      repo.create.mockImplementation((h: any) => h);
      repo.save.mockResolvedValue(undefined);

      const result = await service.seedMissing();

      expect(result.inserted).toBe(rest.length);
      expect(result.skipped).toBe(1);
    });
  });
});
