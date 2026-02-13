import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockService = () => ({
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('UserController', () => {
  let controller: UserController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: service }],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile()', () => {
    it('should return user without passwordHash', async () => {
      service.findOne.mockResolvedValue({
        idUser: 1,
        email: 'a@b.com',
        passwordHash: 'secret',
        firstName: 'A',
      });
      const req = { user: { userId: 1 } };
      const result = await controller.getProfile(req);

      expect(result.email).toBe('a@b.com');
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe('updateProfile()', () => {
    it('should update and strip passwordHash', async () => {
      service.update.mockResolvedValue({
        idUser: 1,
        firstName: 'New',
        passwordHash: 'hashed',
      });
      const req = { user: { userId: 1 } };
      const result = await controller.updateProfile(req, {
        firstName: 'New',
      } as any);

      expect(result.firstName).toBe('New');
      expect((result as any).passwordHash).toBeUndefined();
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
});
