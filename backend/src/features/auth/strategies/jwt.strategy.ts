import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET env variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.access_token;
          if (token) {
            return token;
          }
          return null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token invalide');
    }

    // Les jetons à usage unique — reset de mot de passe (`reset`), confirmation
    // d'adresse (`email-verification`), rafraîchissement (`refresh`) — sont signés
    // avec le MÊME secret que les jetons de session. Sans ce contrôle, ils ouvrent
    // une session complète : un lien de confirmation reçu par email traîne dans une
    // boîte mail, un historique de navigation ou un en-tête Referer, et vaudrait
    // alors un mot de passe. Un jeton d'accès ne porte jamais de `type` : tout
    // jeton typé est refusé ici, quelle que soit sa valeur.
    if (payload.type) {
      throw new UnauthorizedException('Token invalide');
    }

    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
