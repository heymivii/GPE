import { describe, it, expect } from 'vitest';
import { isProfileComplete, missingProfileFields } from './profileCompletion';
import type { User } from '../types/auth';

const complete = {
  age: 30,
  status: 'student',
  countryOriginId: 1,
  languageLevel: 'B2',
} as unknown as User;

describe('isProfileComplete', () => {
  it('reconnaît un profil complet', () => {
    expect(isProfileComplete(complete)).toBe(true);
    expect(missingProfileFields(complete)).toEqual([]);
  });

  it.each(['age', 'status', 'countryOriginId', 'languageLevel'] as const)(
    'signale « %s » manquant',
    (field) => {
      const user = { ...complete, [field]: undefined } as User;
      expect(isProfileComplete(user)).toBe(false);
      expect(missingProfileFields(user)).toContain(field);
    },
  );

  it('traite la chaîne vide comme non renseignée', () => {
    const user = { ...complete, status: '' } as User;
    expect(isProfileComplete(user)).toBe(false);
  });

  it('ne reproche rien tant que l’utilisateur n’est pas chargé', () => {
    // Sinon le bandeau clignote « profil incomplet » à chaque rafraîchissement.
    expect(isProfileComplete(null)).toBe(true);
    expect(isProfileComplete(undefined)).toBe(true);
  });
});
