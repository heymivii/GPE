import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { SupportRatingService } from '../support-rating/support-rating.service';

jest.mock('bcrypt');

const mockUserRepo = () => ({
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn((u) => Promise.resolve(u)),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let repo: ReturnType<typeof mockUserRepo>;

  beforeEach(async () => {
    repo = mockUserRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repo },
        {
          provide: SupportRatingService,
          useValue: {
            getRatingsForUsers: jest.fn().mockResolvedValue(new Map()),
            getUserRating: jest.fn().mockResolvedValue({ average: 0, count: 0 }),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create() ──────────────────────────────────────────────────

  describe('create()', () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'Pass1234',
    };

    it('should create a new user with hashed password', async () => {
      repo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      const created = { idUser: 1, ...dto, password: 'hashed-pw' };
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(dto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('Pass1234', 10);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@test.com',
          password: 'hashed-pw',
        }),
      );
      expect(result.idUser).toBe(1);
    });

    it('should throw ConflictException if email already used', async () => {
      repo.findOne.mockResolvedValue({ idUser: 99 });

      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── findAll() ─────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return all users with relations', async () => {
      repo.findAndCount.mockResolvedValue([[{ idUser: 1 }, { idUser: 2 }], 2]);

      const result = await service.findAll({});
      expect(result.data).toHaveLength(2);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['originCountry'] }),
      );
    });
  });

  // ─── findOne() ─────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a user by id', async () => {
      repo.findOne.mockResolvedValue({ idUser: 1, email: 'a@b.com' });

      const result = await service.findOne(1);
      expect(result.email).toBe('a@b.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findByEmail() ────────────────────────────────────────────

  describe('findByEmail()', () => {
    it('should return user by email', async () => {
      repo.findOne.mockResolvedValue({ idUser: 1, email: 'a@b.com' });

      const result = await service.findByEmail('a@b.com');
      expect(result?.email).toBe('a@b.com');
    });

    it('should return null if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@test.com');
      expect(result).toBeNull();
    });
  });

  // ─── update() ──────────────────────────────────────────────────

  describe('update()', () => {
    it('should update user fields', async () => {
      const user = { idUser: 1, firstName: 'Old', lastName: 'User' };
      repo.findOne.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      const result = await service.update(1, { firstName: 'New' } as any);
      expect(result.firstName).toBe('New');
    });

    it('should hash password when updating password', async () => {
      const user = {
        idUser: 1,
        firstName: 'A',
        lastName: 'B',
        password: 'old',
      };
      repo.findOne.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
      repo.save.mockImplementation(async (u) => u);

      const result = await service.update(1, { password: 'NewPass1' } as any);
      expect(result.password).toBe('new-hashed');
    });

    it('should update firstName when name changes', async () => {
      const user = { idUser: 1, firstName: 'Old', lastName: 'Name' };
      repo.findOne.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      await service.update(1, { firstName: 'New' } as any);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'New' }),
      );
    });
  });

  // ─── remove() ──────────────────────────────────────────────────

  describe('remove()', () => {
    it('should remove user', async () => {
      const user = { idUser: 1 };
      repo.findOne.mockResolvedValue(user);
      repo.remove.mockResolvedValue(user);

      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateRole() / countByRoles() / getStats() ────────────────

  describe('updateRole()', () => {
    it('should update the role and save', async () => {
      const user = { idUser: 1, roles: 'user' };
      repo.findOne.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      const result = await service.updateRole(1, 'admin');
      expect(result.roles).toBe('admin');
    });
  });

  describe('countByRoles()', () => {
    it('should count users matching any of the given roles', async () => {
      repo.count.mockResolvedValue(3);
      const result = await service.countByRoles(['admin', 'moderator']);
      expect(repo.count).toHaveBeenCalledWith({
        where: { roles: expect.anything() },
      });
      expect(result).toBe(3);
    });
  });

  describe('getStats()', () => {
    it('should return the total user count', async () => {
      repo.count.mockResolvedValue(42);
      const result = await service.getStats();
      expect(result).toEqual({ totalUsers: 42 });
    });
  });

  // ─── F1 : experts vérifiés ─────────────────────────────────────

  describe('verifyExpert()', () => {
    it('marks the user as a verified expert (title/bio/country + who + when)', async () => {
      repo.findOne.mockResolvedValue({ idUser: 5, isExpert: false });

      const res = await service.verifyExpert(
        5,
        { expertTitle: 'Immigration lawyer', expertBio: 'bio', expertCountryId: 1 },
        99,
      );

      expect(res.isExpert).toBe(true);
      expect(res.expertTitle).toBe('Immigration lawyer');
      expect(res.expertCountryId).toBe(1);
      expect(res.expertVerifiedAt).toBeInstanceOf(Date);
      expect(res.expertVerifiedBy).toBe(99);
    });
  });

  describe('revokeExpert()', () => {
    it('clears the verification', async () => {
      repo.findOne.mockResolvedValue({
        idUser: 5,
        isExpert: true,
        expertVerifiedAt: new Date(),
        expertVerifiedBy: 99,
      });

      const res = await service.revokeExpert(5);
      expect(res.isExpert).toBe(false);
      expect(res.expertVerifiedAt).toBeNull();
      expect(res.expertVerifiedBy).toBeNull();
    });
  });

  describe('updateExpertProfile()', () => {
    it('updates title/bio for a verified expert WITHOUT touching verification', async () => {
      const verifiedAt = new Date();
      repo.findOne.mockResolvedValue({
        idUser: 5,
        isExpert: true,
        expertVerifiedAt: verifiedAt,
        expertVerifiedBy: 99,
        expertTitle: 'old',
      });

      const res = await service.updateExpertProfile(5, { expertTitle: 'new' });
      expect(res.expertTitle).toBe('new');
      // Vérification intacte.
      expect(res.isExpert).toBe(true);
      expect(res.expertVerifiedAt).toBe(verifiedAt);
      expect(res.expertVerifiedBy).toBe(99);
    });

    it('forbids a non-expert from using the expert profile endpoint', async () => {
      repo.findOne.mockResolvedValue({ idUser: 5, isExpert: false });
      await expect(
        service.updateExpertProfile(5, { expertTitle: 'x' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findExperts()', () => {
    const makeQb = () => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          idUser: 5,
          firstName: 'Ana',
          lastName: 'Lee',
          email: 'secret@x.com',
          expertTitle: 'Lawyer',
          expertBio: 'bio',
          expertVerifiedAt: new Date(),
          expertCountry: { idCountry: 1, countryName: 'France' },
        },
      ]),
    });

    it('filters to verified experts and NEVER exposes email', async () => {
      const qb = makeQb();
      repo.createQueryBuilder.mockReturnValue(qb);

      const res = await service.findExperts();

      // filtre « vérifié »
      expect(qb.where).toHaveBeenCalledWith('u.isExpert = :ex', { ex: true });
      expect(qb.andWhere).toHaveBeenCalledWith('u.expertVerifiedAt IS NOT NULL');
      // forme publique
      expect(res[0]).toEqual(
        expect.objectContaining({
          idUser: 5,
          fullName: 'Ana Lee',
          expertTitle: 'Lawyer',
          expertCountry: { idCountry: 1, countryName: 'France' },
        }),
      );
      expect((res[0] as any).email).toBeUndefined();
    });

    it('applies the country + text filters when provided', async () => {
      const qb = makeQb();
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findExperts(1, 'visa');
      expect(qb.andWhere).toHaveBeenCalledWith('u.expertCountryId = :cid', {
        cid: 1,
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE :q'),
        { q: '%visa%' },
      );
    });
  });
});
