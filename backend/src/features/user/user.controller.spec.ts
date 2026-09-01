import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, ConflictException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AdminLogService } from '../admin-log/admin-log.service';
import { SupportRatingService } from '../support-rating/support-rating.service';

const mockService = () => ({
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  updateRole: jest.fn(),
  countByRoles: jest.fn(),
  findExperts: jest.fn(),
  verifyExpert: jest.fn(),
  revokeExpert: jest.fn(),
  updateExpertProfile: jest.fn(),
  findAll: jest.fn(),
  getStats: jest.fn(),
});

describe('UserController', () => {
  let controller: UserController;
  let service: ReturnType<typeof mockService>;
  let adminLog: { log: jest.Mock };
  let supportRating: { getUserRating: jest.Mock };

  beforeEach(async () => {
    service = mockService();
    adminLog = { log: jest.fn() };
    supportRating = { getUserRating: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: service },
        { provide: AdminLogService, useValue: adminLog },
        {
          provide: SupportRatingService,
          useValue: supportRating,
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserRating()', () => {
    it('should delegate to supportRatingService.getUserRating()', () => {
      supportRating.getUserRating.mockReturnValue({ average: 4.5 });
      const result = controller.getUserRating(1);
      expect(supportRating.getUserRating).toHaveBeenCalledWith(1);
      expect(result).toEqual({ average: 4.5 });
    });
  });

  describe('findExperts()', () => {
    it('should pass undefined countryId when not provided', () => {
      controller.findExperts(undefined, undefined);
      expect(service.findExperts).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should parse a numeric countryId and forward the query', () => {
      controller.findExperts('5', 'guide');
      expect(service.findExperts).toHaveBeenCalledWith(5, 'guide');
    });

    it('should treat a non-numeric countryId as undefined', () => {
      controller.findExperts('abc', undefined);
      expect(service.findExperts).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('verifyExpert()', () => {
    it('should verify, log the action, and strip the password', async () => {
      service.verifyExpert.mockResolvedValue({
        idUser: 2,
        email: 'expert@b.com',
        password: 'secret',
      });
      const req = { user: { userId: 99 } };
      const dto = { expertTitle: 'Notaire' } as any;

      const result = await controller.verifyExpert(2, dto, req);

      expect(service.verifyExpert).toHaveBeenCalledWith(2, dto, 99);
      expect(adminLog.log).toHaveBeenCalledWith(
        99,
        'UPDATE',
        'User',
        '2',
        expect.stringContaining('expert@b.com'),
      );
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('revokeExpert()', () => {
    it('should revoke, log the action, and strip the password', async () => {
      service.revokeExpert.mockResolvedValue({
        idUser: 2,
        email: 'expert@b.com',
        password: 'secret',
      });
      const req = { user: { userId: 99 } };

      const result = await controller.revokeExpert(2, req);

      expect(service.revokeExpert).toHaveBeenCalledWith(2);
      expect(adminLog.log).toHaveBeenCalledWith(
        99,
        'UPDATE',
        'User',
        '2',
        expect.stringContaining('expert@b.com'),
      );
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('updateExpertProfile()', () => {
    it('should update and strip the password', async () => {
      service.updateExpertProfile.mockResolvedValue({
        idUser: 1,
        expertTitle: 'Notaire',
        password: 'secret',
      });
      const req = { user: { userId: 1 } };

      const result = await controller.updateExpertProfile(req, {
        expertTitle: 'Notaire',
      } as any);

      expect(service.updateExpertProfile).toHaveBeenCalledWith(1, {
        expertTitle: 'Notaire',
      });
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('findAll()', () => {
    it('should sanitize passwords out of the paginated result', async () => {
      service.findAll.mockResolvedValue({
        data: [{ idUser: 1, password: 'x' }, { idUser: 2, password: 'y' }],
        total: 2,
      });

      const result = await controller.findAll({} as any);

      expect(result.data.every((u: any) => u.password === undefined)).toBe(
        true,
      );
      expect(result.total).toBe(2);
    });
  });

  describe('getStats()', () => {
    it('should delegate to service.getStats()', async () => {
      service.getStats.mockResolvedValue({ total: 10 });
      const result = await controller.getStats();
      expect(result).toEqual({ total: 10 });
    });
  });

  describe('getProfile()', () => {
    it('should return user without password', async () => {
      service.findOne.mockResolvedValue({
        userId: 1,
        email: 'a@b.com',
        password: 'secret',
        firstName: 'A',
      });
      const req = { user: { userId: 1 } };
      const result = await controller.getProfile(req);

      expect(result.email).toBe('a@b.com');
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('updateProfile()', () => {
    it('should update and strip password', async () => {
      service.update.mockResolvedValue({
        userId: 1,
        firstName: 'New',
        password: 'hashed',
      });
      const req = { user: { userId: 1 } };
      const result = await controller.updateProfile(req, {
        firstName: 'New',
      } as any);

      expect(result.firstName).toBe('New');
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('deleteAccount()', () => {
    it('should delete user and return message', async () => {
      service.remove.mockResolvedValue(undefined);
      const req = { user: { userId: 1 } };
      const result = await controller.deleteAccount(req);

      expect(result.message).toBe('Compte supprimé avec succès');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('updateRole()', () => {
    const adminReq = { user: { userId: 99 } } as any; // the acting admin

    it('refuses to change one’s own role (anti self-lockout)', async () => {
      await expect(
        controller.updateRole(99, { role: 'user' } as any, adminReq),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.updateRole).not.toHaveBeenCalled();
    });

    it('refuses to demote the last admin', async () => {
      service.findOne.mockResolvedValue({ idUser: 5, roles: 'admin', email: 'a@b.com' });
      service.countByRoles.mockResolvedValue(1); // only one admin left
      await expect(
        controller.updateRole(5, { role: 'user' } as any, adminReq),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(service.updateRole).not.toHaveBeenCalled();
    });

    it('demotes an admin when other admins remain, stripping the password', async () => {
      service.findOne.mockResolvedValue({ idUser: 5, roles: 'admin', email: 'a@b.com' });
      service.countByRoles.mockResolvedValue(2);
      service.updateRole.mockResolvedValue({ idUser: 5, roles: 'user', email: 'a@b.com', password: 'x' });
      const result = await controller.updateRole(5, { role: 'user' } as any, adminReq);
      expect(service.updateRole).toHaveBeenCalledWith(5, 'user');
      expect((result as any).password).toBeUndefined();
    });

    it('promotes a user without running the last-admin check', async () => {
      service.findOne.mockResolvedValue({ idUser: 5, roles: 'user', email: 'a@b.com' });
      service.updateRole.mockResolvedValue({ idUser: 5, roles: 'admin', email: 'a@b.com', password: 'x' });
      const result = await controller.updateRole(5, { role: 'admin' } as any, adminReq);
      expect(service.countByRoles).not.toHaveBeenCalled(); // promotion, not a demotion
      expect(service.updateRole).toHaveBeenCalledWith(5, 'admin');
      expect(result.roles).toBe('admin');
    });
  });
});
