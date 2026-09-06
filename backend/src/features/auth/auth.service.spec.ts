import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { MailService } from './mail.service';

jest.mock('bcrypt');

const mockUserRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn().mockResolvedValue(true),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: ReturnType<typeof mockUserRepo>;
  let jwtService: ReturnType<typeof mockJwtService>;
  let mailService: ReturnType<typeof mockMailService>;

  beforeEach(async () => {
    userRepo = mockUserRepo();
    jwtService = mockJwtService();
    mailService = mockMailService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── register() ────────────────────────────────────────────────

  describe('register()', () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password1',
    };

    it('should register a new user successfully', async () => {
      userRepo.findOne.mockResolvedValue(null); // no existing user
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      const createdUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-pw',
        userRole: 'user',
      };
      userRepo.create.mockReturnValue(createdUser);
      userRepo.save.mockResolvedValue(createdUser);

      const result = await service.register(dto as any);

      expect(result.message).toContain('Inscription réussie');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
      // password should be stripped by sanitizeUser
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
      });

      await expect(service.register(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── login() ───────────────────────────────────────────────────

  describe('login()', () => {
    const dto = { email: 'john@example.com', password: 'Password1' };

    it('should login successfully with correct credentials', async () => {
      const user = {
        id: 1,
        email: 'john@example.com',
        password: 'hashed-pw',
        userRole: 'user',
      };
      userRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result.message).toBe('Connexion réussie');
      expect(result.access_token).toBe('mock-jwt-token');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        password: 'hashed-pw',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── getProfile() ─────────────────────────────────────────────

  describe('getProfile()', () => {
    it('should return sanitized user', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'secret',
      };
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.getProfile(1);
      expect(result.email).toBe('test@test.com');
      expect((result as any).password).toBeUndefined();
    });

    it('should throw NotFoundException if user missing', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── refreshToken() ───────────────────────────────────────────

  describe('refreshToken()', () => {
    it('should return new tokens for valid refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, type: 'refresh' });
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'a@b.com',
        userRole: 'user',
      });

      const result = await service.refreshToken('valid-refresh');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.refresh_token).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException for invalid token type', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, type: 'access' });

      await expect(service.refreshToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if verify throws', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('expired');
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when the user no longer exists', async () => {
      jwtService.verify.mockReturnValue({ sub: 999, type: 'refresh' });
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.refreshToken('valid-refresh')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── forgotPassword() ─────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('should send reset email for existing user', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com' });
      jwtService.sign.mockReturnValue('reset-token');

      const result = await service.forgotPassword('a@b.com');
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'a@b.com',
        'reset-token',
      );
      expect(result.message).toContain('réinitialisation');
    });

    it('should return same message for non-existing user (no leak)', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword('unknown@test.com');
      expect(result.message).toContain('réinitialisation');
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  // ─── resetPassword() ──────────────────────────────────────────

  describe('resetPassword()', () => {
    it('should reset password with valid reset token', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, type: 'reset' });
      const user = { id: 1, password: 'old' };
      userRepo.findOne.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
      userRepo.save.mockResolvedValue({ ...user, password: 'new-hashed' });

      const result = await service.resetPassword('reset-token', 'NewPass1');
      expect(result.message).toContain('réinitialisé');
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw for invalid token type', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, type: 'access' });

      await expect(service.resetPassword('bad', 'NewPass1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if verify fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('expired');
      });

      await expect(
        service.resetPassword('expired', 'NewPass1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException (wrapped) when the user no longer exists', async () => {
      jwtService.verify.mockReturnValue({ sub: 999, type: 'reset' });
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword('reset-token', 'NewPass1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("vérification de l'adresse email", () => {
    it('envoie le mail de confirmation à l’inscription', async () => {
      const dto = {
        firstName: 'Tene',
        lastName: 'Coulibaly',
        email: 'tene@skywalk.com',
        password: 'Password1',
      };
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockImplementation((u: any) => u);
      userRepo.save.mockImplementation(async (u: any) => ({ ...u, idUser: 1 }));

      await service.register(dto as any);

      expect(mailService.sendEmailVerification).toHaveBeenCalledWith(
        'tene@skywalk.com',
        'mock-jwt-token',
      );
    });

    it("n'annule pas l'inscription quand l'envoi du mail échoue", async () => {
      // La prod n'a pas de credentials SMTP : un envoi raté ne doit pas
      // transformer une inscription valide en erreur 500.
      mailService.sendEmailVerification.mockResolvedValue(false);
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockImplementation((u: any) => u);
      userRepo.save.mockImplementation(async (u: any) => ({ ...u, idUser: 1 }));

      const result = await service.register({
        firstName: 'Tene',
        lastName: 'Coulibaly',
        email: 'tene@skywalk.com',
        password: 'Password1',
      } as any);

      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('marque l’adresse comme vérifiée avec un token valide', async () => {
      const user = { idUser: 1, email: 'a@b.com', emailVerifiedAt: null };
      jwtService.verify.mockReturnValue({ sub: 1, type: 'email-verification' });
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockImplementation(async (u: any) => u);

      const result = await service.verifyEmail('token');

      expect(user.emailVerifiedAt).toBeInstanceOf(Date);
      expect(result.user.emailVerified).toBe(true);
    });

    it('reste idempotent : un lien déjà utilisé ne renvoie pas d’erreur', async () => {
      const alreadyVerified = new Date('2026-01-01');
      const user = { idUser: 1, email: 'a@b.com', emailVerifiedAt: alreadyVerified };
      jwtService.verify.mockReturnValue({ sub: 1, type: 'email-verification' });
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.verifyEmail('token');

      expect(result.message).toBe('Adresse email confirmée');
      expect(user.emailVerifiedAt).toBe(alreadyVerified); // pas réécrite
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('refuse un token signé pour un autre usage (ex. reset de mot de passe)', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, type: 'reset' });

      await expect(service.verifyEmail('reset-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('refuse un token expiré ou falsifié', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.verifyEmail('expired')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('renvoie un nouveau lien à un compte non vérifié', async () => {
      userRepo.findOne.mockResolvedValue({
        idUser: 1,
        email: 'a@b.com',
        emailVerifiedAt: null,
      });

      const result = await service.resendVerificationEmail(1);

      expect(mailService.sendEmailVerification).toHaveBeenCalled();
      expect(result.message).toBe('Email de confirmation envoyé');
    });

    it('ne renvoie rien si l’adresse est déjà confirmée', async () => {
      userRepo.findOne.mockResolvedValue({
        idUser: 1,
        email: 'a@b.com',
        emailVerifiedAt: new Date(),
      });

      const result = await service.resendVerificationEmail(1);

      expect(mailService.sendEmailVerification).not.toHaveBeenCalled();
      expect(result.message).toContain('déjà confirmée');
    });

    it('expose emailVerified=false tant que l’adresse n’est pas confirmée', async () => {
      userRepo.findOne.mockResolvedValue({
        idUser: 1,
        email: 'a@b.com',
        emailVerifiedAt: null,
      });

      const profile: any = await service.getProfile(1);

      expect(profile.emailVerified).toBe(false);
    });
  });
});
