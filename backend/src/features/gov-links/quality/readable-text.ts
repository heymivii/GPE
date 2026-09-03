/**
 * MATIÈRE PREMIÈRE DE L'IA — ce que le modèle reçoit avant d'extraire quoi que ce soit.
 *
 * Deux défauts de la chaîne d'origine plafonnaient la qualité d'extraction, quelle que
 * soit la qualité du prompt :
 *
 *   1. CASSE DÉTRUITE — `extractText` passait toute la page en minuscules avant de
 *      l'envoyer au modèle. « CERFA 14571*06 », « CPAM », « PUMa », « France Travail »
 *      arrivaient en « cerfa 14571*06 », « cpam »… Le modèle perdait le signal le plus
 *      fiable pour repérer un sigle, un formulaire ou un organisme. La casse ne sert
 *      qu'à la comparaison de mots-clés : on la neutralise AU MOMENT de comparer, pas
 *      à la source.
 *
 *   2. MENUS MÉLANGÉS AU CONTENU — le détourage se limitait à retirer les balises. Le
 *      menu, le fil d'ariane, le pied de page et le bandeau cookies se retrouvaient
 *      dans le texte. C'est l'origine directe de l'étape « Études », dont les « tâches »
 *      sont le menu de navigation de Campus France.
 *
 * Ce module est pur : aucun réseau, aucun LLM, entièrement testable.
 */

/** Blocs structurellement hors-contenu : on retire la balise ET son contenu. */
const BOILERPLATE_TAGS = [
  'script',
  'style',
  'noscript',
  'svg',
  'nav',
  'header',
  'footer',
  'aside',
  'button',
  'select',
];

/**
 * Conteneurs hors-contenu repérés par leur class/id. Volontairement resserré : rater un
 * menu coûte du bruit, retirer un vrai contenu coûte une information manquante.
 */
const BOILERPLATE_ATTR =
  /(^|[\s_-])(nav|navbar|menu|breadcrumb|cookie|consent|banner|social|share|newsletter|sidebar|skiplink|skip-link|footer|header|modal|popin|search-form|form-search)([\s_-]|$)/i;

/** Entités HTML les plus fréquentes sur les pages gouvernementales francophones. */
const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&ecirc;': 'ê',
  '&agrave;': 'à',
  '&ccedil;': 'ç',
  '&ugrave;': 'ù',
  '&ocirc;': 'ô',
  '&icirc;': 'î',
  '&ucirc;': 'û',
  '&acirc;': 'â',
  '&euml;': 'ë',
  '&iuml;': 'ï',
  '&ouml;': 'ö',
  '&uuml;': 'ü',
  '&euro;': '€',
};

function decodeEntities(input: string): string {
  let out = input;
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    out = out.split(entity).join(char);
  }
  // Entités numériques restantes (&#233; …) — le reste est remplacé par une espace.
  return out
    .replace(/&#(\d+);/g, (_m, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&[a-z]+;/gi, ' ');
}

/** Retire les blocs de navigation, d'habillage et de scripts — balise et contenu. */
export function stripBoilerplate(html: string): string {
  let out = html ?? '';

  for (const tag of BOILERPLATE_TAGS) {
    out = out.replace(
      new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'),
      ' ',
    );
    // Balise auto-fermante ou non refermée : on retire au moins l'ouverture.
    out = out.replace(new RegExp(`<${tag}\\b[^>]*/?>`, 'gi'), ' ');
  }

  // Conteneurs identifiés par class/id — on retire le bloc <div>…</div> correspondant.
  out = out.replace(
    /<(div|section|ul|li)\b[^>]*(?:class|id)\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/\1>/gi,
    (match, _tag, attr: string) => (BOILERPLATE_ATTR.test(attr) ? ' ' : match),
  );

  return out;
}

/**
 * HTML → texte lisible, CASSE PRÉSERVÉE. Les balises de bloc deviennent des sauts de
 * ligne : le modèle retrouve la structure en paragraphes et en listes, qui porte
 * beaucoup d'information sur une page administrative.
 */
export function toReadableText(html: string): string {
  const stripped = stripBoilerplate(html ?? '');

  const withBreaks = stripped
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|table|br)\s*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ');

  return decodeEntities(withBreaks.replace(/<[^>]+>/g, ' '))
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line, i, arr) => line !== '' || arr[i - 1] !== '')
    .join('\n')
    .trim();
}

/** Ligne courte, nue, sans chiffre ni ponctuation — candidate « reste de menu ». */
function isShortBareLine(line: string): boolean {
  const bare = line.trim();
  // Une puce est un élément de liste de CONTENU (pièces à fournir…), jamais un menu ici.
  if (!bare || bare.startsWith('- ')) return false;
  const words = bare.split(/\s+/).length;
  return words <= 3 && !/[.!?:;,)»]$/.test(bare) && !/\d/.test(bare);
}

/** Un bloc d'au moins autant de lignes courtes consécutives est traité comme un menu. */
const MENU_RUN_MIN = 3;

/**
 * Retire les RÉSIDUS de menu que le détourage structurel a laissés passer.
 *
 * Une ligne courte ISOLÉE est conservée : c'est presque toujours un titre de section
 * (« Pièces justificatives », « Documents nécessaires ») — une structure précieuse pour
 * le modèle. Un menu, lui, laisse une RAFALE de lignes courtes consécutives : c'est ce
 * motif-là qu'on supprime, jamais la ligne seule.
 */
export function dropMenuLines(text: string): string {
  const lines = (text ?? '').split('\n');
  const keep = lines.map(() => true);

  let runStart = -1;
  for (let i = 0; i <= lines.length; i++) {
    const short = i < lines.length && isShortBareLine(lines[i]);
    if (short && runStart === -1) runStart = i;
    if (!short && runStart !== -1) {
      if (i - runStart >= MENU_RUN_MIN) {
        for (let j = runStart; j < i; j++) keep[j] = false;
      }
      runStart = -1;
    }
  }

  return lines
    .filter((_, i) => keep[i])
    .join('\n')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Sélectionne l'extrait le PLUS PERTINENT plutôt que les N premiers caractères.
 *
 * Une page administrative commence par du chapeau et de la navigation : tronquer au
 * début revient souvent à donner au modèle tout sauf la procédure. On découpe donc en
 * fenêtres, on note chaque fenêtre par le nombre d'occurrences des mots-clés de la
 * catégorie, et on renvoie la zone la plus dense (avec son voisinage immédiat).
 *
 * Sans mot-clé exploitable, on retombe sur les `maxChars` premiers caractères.
 */
export function selectRelevantExcerpt(
  text: string,
  keywords: string[],
  maxChars = 8000,
): string {
  const clean = (text ?? '').trim();
  if (clean.length <= maxChars) return clean;

  const terms = (keywords ?? [])
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 2);
  if (terms.length === 0) return clean.slice(0, maxChars);

  const windowSize = Math.max(1000, Math.floor(maxChars / 4));
  const haystack = clean.toLowerCase();

  let bestStart = 0;
  let bestScore = -1;
  for (let start = 0; start < clean.length; start += windowSize) {
    const chunk = haystack.slice(start, start + windowSize);
    const score = terms.reduce(
      (acc, term) => acc + chunk.split(term).length - 1,
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestStart = start;
    }
  }

  // Centrer la fenêtre retenue dans l'extrait final : le contexte autour compte.
  const padding = Math.floor((maxChars - windowSize) / 2);
  const from = Math.max(0, bestStart - padding);
  return clean.slice(from, from + maxChars).trim();
}
