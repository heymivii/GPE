import { User } from './entities/user.entity';

/**
 * Retire le mot de passe d'un utilisateur AVANT de le renvoyer, en conservant
 * les champs dérivés.
 *
 * Pourquoi un helper plutôt qu'un `const { password, ...rest } = user` : ce
 * spread ne copie que les propriétés propres de l'objet. `fullName` est un
 * getter porté par le prototype de User — il disparaissait donc de toutes les
 * réponses, et la page Profil affichait « Utilisateur » à la place du nom
 * (retour de recette). On le recalcule explicitement, ce qui marche aussi bien
 * sur une instance que sur un objet déjà aplati.
 */
export function toPublicUser<T extends Partial<User>>(user: T) {
  const { password: _password, ...rest } = user as T & { password?: string };
  return {
    ...rest,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
  };
}
