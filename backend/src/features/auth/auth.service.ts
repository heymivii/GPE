import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Recherche par email insensible à la casse. Les emails saisis sont désormais
   * normalisés en minuscules à l'inscription, mais des comptes plus anciens ont
   * pu être créés avec des majuscules : une égalité stricte les empêcherait de
   * se connecter. On compare donc en minuscules des deux côtés.
   */
  private findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email: Raw((alias) => `LOWER(${alias}) = LOWER(:email)`, {
          email: (email ?? '').trim(),
        }),
      },
    });
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.userRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: hashedPassword,
      roles: 'user',
      age: registerDto.age,
      countryOriginId: registerDto.countryOriginId,
    });

    await this.userRepository.save(newUser);

    // Envoi de la confirmation d'adresse. `sendEmailVerification` n'échoue jamais
    // (retourne false) : une panne SMTP ne doit pas annuler une inscription
    // valide — l'utilisateur pourra toujours redemander l'envoi.
    await this.mailService.sendEmailVerification(
      newUser.email,
      this.generateEmailVerificationToken(newUser),
    );

    const token = this.generateToken(newUser);
    const refreshToken = this.generateRefreshToken(newUser);

    return {
      message:
        'Inscription réussie — un email de confirmation vient de vous être envoyé',
      user: this.sanitizeUser(newUser),
      access_token: token,
      refresh_token: refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      message: 'Connexion réussie',
      user: this.sanitizeUser(user),
      access_token: token,
      refresh_token: refreshToken,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { idUser: userId },
      // Aligné sur GET /users/me : charge le pays d'origine pour un profil cohérent.
      relations: ['originCountry'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.sanitizeUser(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token invalide');
      }

      const user = await this.userRepository.findOne({
        where: { idUser: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Token invalide');
      }

      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return { access_token: newToken, refresh_token: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.findByEmail(email);

    if (!user) {
      return {
        message:
          'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.idUser, type: 'reset' },
      { expiresIn: '1h' },
    );

    await this.mailService.sendPasswordResetEmail(email, resetToken);

    return {
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'reset') {
        throw new UnauthorizedException('Token invalide');
      }

      const user = await this.userRepository.findOne({
        where: { idUser: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await this.userRepository.save(user);

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  /**
   * Confirme l'adresse email à partir du lien reçu. Idempotent : recliquer sur
   * un lien déjà utilisé renvoie un succès plutôt qu'une erreur (le lien reste
   * valide 24 h et les clients mail le préchargent parfois).
   */
  async verifyEmail(token: string) {
    let payload: { sub: number; type?: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException(
        'Lien de confirmation invalide ou expiré — demandez un nouvel envoi',
      );
    }

    if (payload.type !== 'email-verification') {
      throw new UnauthorizedException('Lien de confirmation invalide');
    }

    const user = await this.userRepository.findOne({
      where: { idUser: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
      await this.userRepository.save(user);
    }

    return {
      message: 'Adresse email confirmée',
      user: this.sanitizeUser(user),
    };
  }

  /** Renvoie le lien de confirmation à l'utilisateur connecté. */
  async resendVerificationEmail(userId: number) {
    const user = await this.userRepository.findOne({
      where: { idUser: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.emailVerifiedAt) {
      return { message: 'Votre adresse email est déjà confirmée' };
    }

    const sent = await this.mailService.sendEmailVerification(
      user.email,
      this.generateEmailVerificationToken(user),
    );

    return {
      message: sent
        ? 'Email de confirmation envoyé'
        : "L'envoi a échoué, réessayez dans quelques minutes",
    };
  }

  private generateEmailVerificationToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.idUser, type: 'email-verification' },
      { expiresIn: '24h' },
    );
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.idUser,
      email: user.email,
      role: user.roles,
    };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.idUser,
      type: 'refresh',
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  private sanitizeUser(user: User) {
    const { password: _pw, ...sanitized } = user;
    // Booléen dérivé : le front n'a pas à connaître la date, seulement l'état.
    return { ...sanitized, emailVerified: !!user.emailVerifiedAt };
  }
}
