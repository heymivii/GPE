import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Règle unique pour prénom / nom, partagée par l'inscription, la création
 * d'utilisateur et la mise à jour du profil (retour de recette : on pouvait
 * enregistrer « <script>alert(1)</script> » ou « 123 » comme prénom).
 *
 * Autorisé : lettres de n'importe quel alphabet (\p{L}) et leurs accents
 * (\p{M}), espace, apostrophe droite ou typographique, tiret.
 *   → Jean-Pierre, O'Brien, Anne Marie, José, Müller, Nguyễn, Tené
 * Refusé : chiffres, ponctuation, balises, emojis, et tout nom qui ne commence
 * pas par une lettre.
 *   → <script>, Jean123, @@@, 😀, -Paul
 */
export const PERSON_NAME_REGEX = /^\p{L}[\p{L}\p{M} '’-]*$/u;

export const PERSON_NAME_MAX_LENGTH = 50; // = varchar(50) en base

export const PERSON_NAME_MESSAGE =
  'Ne peut contenir que des lettres, espaces, apostrophes et tirets';

/**
 * Compose toutes les contraintes d'un nom de personne, en normalisant d'abord
 * les espaces (« Jean   Pierre » → « Jean Pierre », espaces de bord retirés)
 * pour que la longueur et le motif portent sur la valeur réellement stockée.
 */
export function IsPersonName(label: 'Le prénom' | 'Le nom') {
  return applyDecorators(
    Transform(({ value }) =>
      typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
    ),
    IsString({ message: `${label} est requis` }),
    MinLength(2, { message: `${label} doit contenir au moins 2 caractères` }),
    MaxLength(PERSON_NAME_MAX_LENGTH, {
      message: `${label} ne doit pas dépasser ${PERSON_NAME_MAX_LENGTH} caractères`,
    }),
    Matches(PERSON_NAME_REGEX, { message: `${label} ${PERSON_NAME_MESSAGE.toLowerCase()}` }),
  );
}
