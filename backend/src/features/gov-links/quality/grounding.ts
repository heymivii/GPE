/**
 * ANCRAGE (span validation) — 2ᵉ garde-fou du pipeline gov-links.
 *
 * Le résumeur reçoit une consigne anti-hallucination stricte, mais une consigne n'est
 * pas une garantie : rien ne vérifiait jusqu'ici que les faits et actions extraits
 * existent RÉELLEMENT dans la page source. Ce module le mesure, sans LLM et sans
 * réseau — déterministe, donc testable et reproductible.
 *
 * Principe : un élément est « ancré » quand une majorité de ses mots porteurs se
 * retrouve dans le texte de la page. On compare des formes normalisées (sans accents,
 * sans ponctuation) pour ne pas rejeter « séjour » face à « sejour ».
 */

/** Mots-outils français et anglais : présents partout, ils ne prouvent aucun ancrage. */
const STOP_WORDS = new Set([
  'avec',
  'dans',
  'pour',
  'vous',
  'votre',
  'vos',
  'être',
  'etre',
  'cette',
  'cettes',
  'leur',
  'leurs',
  'plus',
  'moins',
  'aussi',
  'donc',
  'mais',
  'chez',
  'sans',
  'sous',
  'entre',
  'depuis',
  'apres',
  'avant',
  'pendant',
  'selon',
  'elle',
  'ils',
  'elles',
  'nous',
  'tout',
  'tous',
  'toute',
  'toutes',
  'meme',
  'memes',
  'autre',
  'autres',
  'faire',
  'fait',
  'faites',
  'peut',
  'peuvent',
  'doit',
  'doivent',
  'sont',
  'est',
  'devez',
  'devra',
  'devront',
  'pouvez',
  'pourrez',
  'faut',
  'ainsi',
  'aupres',
  'the',
  'and',
  'for',
  'you',
  'your',
  'with',
  'from',
  'that',
  'this',
  'have',
  'has',
  'will',
  'must',
  'can',
  'may',
  'should',
  'their',
  'they',
  'been',
  'were',
  'was',
]);

/** Minuscules, sans accents ni ponctuation : la seule forme sur laquelle on compare. */
export function normalizeForMatch(input: string): string {
  return (input ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Mots porteurs de sens d'un énoncé (> 3 lettres, hors mots-outils). */
export function contentWords(input: string): string[] {
  return normalizeForMatch(input)
    .split(' ')
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

/** Part des mots porteurs d'un élément qui doit figurer dans la page pour le dire ancré. */
export const MIN_ITEM_OVERLAP = 0.6;

/** Mots-fonction français : leur densité trahit la langue d'un texte. */
const FRENCH_FUNCTION_WORDS =
  /\b(le|la|les|des|une|un|et|est|de|du|en|pour|que|qui|dans|sur|au|aux|ce|cette|vous|votre|vos)\b/gi;

/** Densité minimale de mots-fonction français pour déclarer un texte francophone. */
const FRENCH_DENSITY_THRESHOLD = 0.1;

/**
 * Le texte est-il vraisemblablement du français ? Nécessaire parce que le résumeur
 * répond TOUJOURS en français (règle du prompt) alors que les pages US/JP/DE sont dans
 * leur langue : comparer des mots français à une page anglaise donnerait un ancrage
 * proche de zéro et dégraderait À TORT tous les liens non francophones.
 */
export function isLikelyFrench(text: string): boolean {
  const sample = (text ?? '').slice(0, 4000);
  const words = sample.split(/\s+/).filter(Boolean).length;
  if (words < 20) return false;
  const hits = sample.match(FRENCH_FUNCTION_WORDS)?.length ?? 0;
  return hits / words >= FRENCH_DENSITY_THRESHOLD;
}

/**
 * Un élément sans mot porteur (« Valider. ») est compté comme ancré : ce n'est pas un
 * problème d'ancrage mais de vacuité, et c'est le linter métier qui le sanctionne.
 */
export function isGrounded(item: string, normalizedPage: string): boolean {
  const words = contentWords(item);
  if (words.length === 0) return true;
  const hits = words.filter((w) => normalizedPage.includes(w)).length;
  return hits / words.length >= MIN_ITEM_OVERLAP;
}

/**
 * Ratio [0..1] d'éléments ancrés dans la page source.
 *
 * Renvoie 1 (neutre) quand la vérification est impossible — aucun élément à vérifier,
 * ou pas de texte source. Un garde-fou muet ne doit JAMAIS dégrader un lien correct :
 * l'absence de preuve à charge n'est pas une preuve de faute.
 */
export function groundingRatio(
  items: Array<string | null | undefined>,
  pageText?: string | null,
): number {
  const list = (items ?? []).filter((i): i is string => !!i && !!i.trim());
  if (list.length === 0) return 1;
  if (!pageText || !pageText.trim()) return 1;
  // Page non francophone (US/JP, page DE d'un site suisse…) : l'ancrage lexical
  // français→autre langue est structurellement impossible → neutre, pas coupable.
  if (!isLikelyFrench(pageText)) return 1;

  const haystack = normalizeForMatch(pageText);
  if (!haystack) return 1;

  const grounded = list.filter((i) => isGrounded(i, haystack)).length;
  return grounded / list.length;
}

/** Les éléments NON ancrés — pour dire à l'admin ce qui cloche, pas juste un pourcentage. */
export function ungroundedItems(
  items: Array<string | null | undefined>,
  pageText?: string | null,
): string[] {
  const list = (items ?? []).filter((i): i is string => !!i && !!i.trim());
  if (!pageText || !pageText.trim()) return [];
  if (!isLikelyFrench(pageText)) return [];
  const haystack = normalizeForMatch(pageText);
  if (!haystack) return [];
  return list.filter((i) => !isGrounded(i, haystack));
}
