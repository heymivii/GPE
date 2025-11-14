// 📍 EMPLACEMENT : backend/src/features/auth/strategies/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey', // 🔑 clé par défaut si non définie dans .env
    });
  }

  async validate(payload: any) {
    // Le contenu du payload provient du token JWT signé lors de la connexion
    return { userId: payload.sub, email: payload.email };
  }
}
