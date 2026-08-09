import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Comme JwtAuthGuard mais NON bloquant : si aucun token valide n'est présent,
 * la requête passe quand même avec `req.user` à undefined (utilisateur anonyme).
 * Utile pour les routes publiques qui enrichissent leur réponse quand on est connecté
 * (ex. `isFollowedByMe` sur un topic).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user ?? null;
  }
}
