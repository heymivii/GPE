import type { User } from '../types/auth';

/**
 * Champs du profil qui alimentent réellement la personnalisation (visa selon la
 * nationalité, recommandations selon le statut et le niveau de langue).
 * Prénom et nom sont obligatoires à l'inscription : ils sont toujours là.
 */
const REQUIRED_FIELDS = [
  'age',
  'status',
  'countryOriginId',
  'languageLevel',
] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

function isFilled(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

/** Champs encore vides, dans l'ordre du formulaire de profil. */
export function missingProfileFields(user?: User | null): RequiredField[] {
  if (!user) return [];
  return REQUIRED_FIELDS.filter((field) => !isFilled(user[field]));
}

/**
 * Un profil sans utilisateur chargé est considéré COMPLET : mieux vaut ne rien
 * afficher que reprocher un profil incomplet à quelqu'un dont les données ne
 * sont pas encore arrivées.
 */
export function isProfileComplete(user?: User | null): boolean {
  if (!user) return true;
  return missingProfileFields(user).length === 0;
}
