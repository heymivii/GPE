import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = () => ({
  register: jest.fn(),
  login: jest.fn(),
  getProfile: jest.fn(),
  refreshToken: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
});

const mockResponse = () => ({
  cookie: jest.fn(),
  clearCookie: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: ReturnType<typeof mockAuthService>;
  let res: ReturnType<typeof mockResponse>;

  beforeEach(async () => {
    service = mockAuthService();
    res = mockResponse();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── register ──────────────────────────────────────────────────

  describe('register()', () => {
    it('should register and set httpOnly cookie', async () => {
      const dto = { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'Pass1234' };
      service.register.mockResolvedValue({
        message: 'Inscription réussie',
        user: { idUser: 1 },
        access_token: 'tok',
        refresh_token: 'ref',
      });

      const result = await controller.register(dto as any, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'tok',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result.access_token).toBe('tok');
      expect(result.user.idUser).toBe(1);
    });
  });

  // ─── login ─────────────────────────────────────────────────────

  describe('login()', () => {
    it('should login and set httpOnly cookie', async () => {
      const dto = { email: 'a@b.com', password: 'Pass1234' };
      service.login.mockResolvedValue({
        message: 'Connexion réussie',
        user: { idUser: 1 },
        access_token: 'tok',
        refresh_token: 'ref',
      });

      const result = await controller.login(dto as any, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'tok',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      );
      expect(result.message).toBe('Connexion réussie');
    });
  });

  // ─── getProfile ────────────────────────────────────────────────

  describe('getProfile()', () => {
    it('should return user profile', async () => {
      service.getProfile.mockResolvedValue({ idUser: 1, email: 'a@b.com' });
      const req = { user: { userId: 1 } };

      const result = await controller.getProfile(req);
      expect(service.getProfile).toHaveBeenCalledWith(1);
      expect(result.email).toBe('a@b.com');
    });
  });

  // ─── logout ────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should clear the cookie', async () => {
      const result = await controller.logout(res as any);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result.message).toBe('Déconnexion réussie');
    });
  });

  // ─── refresh ───────────────────────────────────────────────────

  describe('refresh()', () => {
    it('should return new tokens', async () => {
      service.refreshToken.mockResolvedValue({
        access_token: 'new-tok',
        refresh_token: 'new-ref',
      });

      const result = await controller.refresh('old-ref');
      expect(service.refreshToken).toHaveBeenCalledWith('old-ref');
      expect(result.access_token).toBe('new-tok');
    });
  });

  // ─── forgotPassword ────────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('should delegate to service', async () => {
      service.forgotPassword.mockResolvedValue({ message: 'ok' });

      const result = await controller.forgotPassword({ email: 'a@b.com' } as any);
      expect(service.forgotPassword).toHaveBeenCalledWith('a@b.com');
      expect(result.message).toBe('ok');
    });
  });

  // ─── resetPassword ─────────────────────────────────────────────

  describe('resetPassword()', () => {
    it('should delegate to service', async () => {
      service.resetPassword.mockResolvedValue({ message: 'reset done' });

      const result = await controller.resetPassword({
        token: 'tok',
        newPassword: 'Pass1234',
      } as any);
      expect(service.resetPassword).toHaveBeenCalledWith('tok', 'Pass1234');
      expect(result.message).toBe('reset done');
    });
  });
});
