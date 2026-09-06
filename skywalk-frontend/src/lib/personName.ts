/**
 * Règle de nom/prénom, miroir exact de `backend/src/common/validation/person-name.ts`.
 * Objectif : dire tout de suite à la personne que « Jean123 » ne passera pas,
 * au lieu de lui renvoyer une erreur 400 après le clic.
 * La validation backend reste la seule qui fasse foi.
 */
export const PERSON_NAME_REGEX = /^\p{L}[\p{L}\p{M} '’-]*$/u;

export const PERSON_NAME_MAX_LENGTH = 50;

/** Espaces de bord retirés et espaces internes réduits à un seul. */
export function normalizePersonName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isValidPersonName(value: string): boolean {
  const normalized = normalizePersonName(value);
  return (
    normalized.length >= 2 &&
    normalized.length <= PERSON_NAME_MAX_LENGTH &&
    PERSON_NAME_REGEX.test(normalized)
  );
}
