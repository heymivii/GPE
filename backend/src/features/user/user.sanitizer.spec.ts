import { toPublicUser } from './user.sanitizer';
import { User } from './entities/user.entity';

describe('toPublicUser', () => {
  function makeUser(overrides: Partial<User> = {}): User {
    const user = new User();
    Object.assign(user, {
      idUser: 1,
      firstName: 'Camille',
      lastName: 'Durand',
      email: 'camille@skywalk.com',
      password: 'hash-bcrypt',
      ...overrides,
    });
    return user;
  }

  it('retire le mot de passe', () => {
    expect(toPublicUser(makeUser())).not.toHaveProperty('password');
  });

  it('conserve fullName, que le spread perdait (getter du prototype)', () => {
    // Retour de recette : la page Profil affichait « Utilisateur » alors que
    // le compte avait bien un prénom et un nom.
    const user = makeUser();
    const { password: _pw, ...spread } = user;
    expect(spread).not.toHaveProperty('fullName'); // le bug d'origine
    expect(toPublicUser(user).fullName).toBe('Camille Durand');
  });

  it('fonctionne aussi sur un objet déjà aplati (pas une instance)', () => {
    const plain = {
      firstName: 'Jean',
      lastName: 'Dupont',
      password: 'hash',
    } as Partial<User>;
    expect(toPublicUser(plain).fullName).toBe('Jean Dupont');
  });

  it('ne laisse pas d’espace parasite quand une moitié du nom manque', () => {
    expect(toPublicUser(makeUser({ lastName: undefined })).fullName).toBe('Camille');
    expect(toPublicUser(makeUser({ firstName: undefined })).fullName).toBe('Durand');
  });
});
