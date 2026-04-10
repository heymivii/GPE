import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt');

const mockUserRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
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
      const created = { id: 1, ...dto, password: 'hashed-pw' };
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
      expect(result.id).toBe(1);
    });

    it('should throw ConflictException if email already used', async () => {
      repo.findOne.mockResolvedValue({ id: 99 });

      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── findAll() ─────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return all users with relations', async () => {
      repo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['originCountry'] }),
      );
    });
  });

  // ─── findOne() ─────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return a user by id', async () => {
      repo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com' });

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
      repo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com' });

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
      const user = { id: 1, firstName: 'Old', lastName: 'User' };
      repo.findOne.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      const result = await service.update(1, { firstName: 'New' } as any);
      expect(result.firstName).toBe('New');
    });

    it('should hash password when updating password', async () => {
      const user = {
        id: 1,
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

    it('should rebuild fullName when name changes', async () => {
      const user = { id: 1, firstName: 'Old', lastName: 'Name' };
      repo.findOne.mockResolvedValue(user);
      repo.save.mockImplementation(async (u) => u);

      await service.update(1, { firstName: 'New' } as any);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: expect.any(String) }),
      );
    });
  });

  // ─── remove() ──────────────────────────────────────────────────

  describe('remove()', () => {
    it('should remove user', async () => {
      const user = { id: 1 };
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
});
