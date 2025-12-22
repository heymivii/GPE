import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const fullName = `${registerDto.firstName} ${registerDto.lastName}`;

    const newUser = this.userRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      fullName: fullName,
      email: registerDto.email,
      passwordHash: hashedPassword,
      userRole: 'user',
      age: registerDto.age,
      status: registerDto.status,
      languageLevel: registerDto.languageLevel,
      idOriginCountry: registerDto.idOriginCountry,
    });

    await this.userRepository.save(newUser);

    const token = this.generateToken(newUser);

    return {
      message: 'Inscription réussie',
      user: this.sanitizeUser(newUser),
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const token = this.generateToken(user);

    return {
      message: 'Connexion réussie',
      user: this.sanitizeUser(user),
      access_token: token,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { idUser: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.sanitizeUser(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { idUser: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Token invalide');
      }

      const newToken = this.generateToken(user);

      return { access_token: newToken };
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

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
      user.passwordHash = hashedPassword;

      await this.userRepository.save(user);

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.idUser,
      email: user.email,
      role: user.userRole,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
