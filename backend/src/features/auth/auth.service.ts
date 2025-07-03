import { Injectable, UnauthorizedException } from '@nestjs/common'; //UnauthorizedException : exception HTTP 401 utilisée quand l’authentification échoue.
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async signup(email: string, password: string) {
    const user = await this.userService.create(email, password);
    return this.getToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Mot de passe incorrect');

    return this.getToken(user.id, user.email);
  }

  private getToken(id: number, email: string) {
    return {
      access_token: this.jwtService.sign({ sub: id, email }),
    };
  }
}
