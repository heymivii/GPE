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
});

describe('UserController', () => {
  let controller: UserController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: service },
        { provide: AdminLogService, useValue: { log: jest.fn() } },
        {
          provide: SupportRatingService,
          useValue: { getUserRating: jest.fn() },
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
