/**
 * LINTER MÉTIER — 3ᵉ garde-fou du pipeline gov-links.
 *
 * L'ancrage vérifie que le contenu VIENT BIEN de la page ; il ne dit rien de sa
 * pertinence. Une extraction peut être parfaitement fidèle à sa source et rester
 * inutilisable dans une checklist. Les quatre familles ci-dessous viennent toutes de
 * cas réellement observés en base sur la France :
 *
 *   HORS-SUJET   « Assurance maladie & santé » dont les actions parlent de France
 *                Travail et de titre de séjour — aucune mention de CPAM, carte Vitale
 *                ou PUMa. Le contenu relève en réalité d'« emploi ».
 *   VACUITÉ      « Renseigner les informations demandées / Valider votre saisie /
 *                Attendre la réponse » : des étapes de formulaire sans objet, qui
 *                n'apprennent rien à personne.
 *   NAVIGATION   Les « actions » de l'étape Études sont le menu de Campus France
 *                (« Trouver sa formation », « Ouvrir un compte bancaire »…), pas des
 *                tâches — et deux d'entre elles doublonnent d'autres catégories.
 *   DISPOSITIF   Mention d'un dispositif réservé à un public que l'expatrié n'est pas
 *                (règle AME préexistante, conservée telle quelle).
 */

import { normalizeForMatch } from './grounding';

export interface LintInput {
  category: string;
  facts?: string[];
  actions?: string[];
}

export interface LintVerdict {
  flags: string[];
}

/**
 * Vocabulaire attendu par catégorie. Sert deux mesures : la présence du thème (au
 * moins un terme) et la DOMINANCE d'un thème étranger (une autre catégorie mieux
 * représentée que celle annoncée).
 */
export const CATEGORY_VOCABULARY: Record<string, string[]> = {
  visa: ['visa', 'consulat', 'ambassade', 'vls', 'long sejour', 'entree'],
  demarches: [
    'titre de sejour',
    'carte de sejour',
    'prefecture',
    'renouvellement',
    'recepisse',
  ],
  'demarches-admin': [
    'etat civil',
    'attestation',
    'formulaire',
    'administration',
    'declaration',
  ],
  logement: [
    'logement',
    'louer',
    'location',
    'bail',
    'locataire',
    'loyer',
    'proprietaire',
    'caution',
  ],
  sante: [
    'assurance maladie',
    'securite sociale',
    'cpam',
    'carte vitale',
    'puma',
    'medecin',
    'mutuelle',
    'sante',
    'soins',
  ],
  emploi: [
    'emploi',
    'travail',
    'salarie',
    'contrat',
    'employeur',
    'chomage',
    'france travail',
    'recrutement',
  ],
  banque: ['compte bancaire', 'banque', 'rib', 'iban', 'depot', 'epargne'],
  transport: [
    'permis de conduire',
    'conduire',
    'vehicule',
    'immatriculation',
    'transport',
  ],
  education: [
    'inscription',
    'universite',
    'etudiant',
    'diplome',
    'ecole',
    'formation',
    'candidature',
  ],
  culture: [
    'culture',
    'association',
    'musee',
    'bibliotheque',
    'patrimoine',
    'spectacle',
    'loisirs',
  ],
  business: [
    'entreprise',
    'societe',
    'immatriculation',
    'independant',
    'auto entrepreneur',
    'siret',
  ],
};

/**
 * Étapes de formulaire génériques : vraies dans n'importe quelle démarche, donc
 * informatives dans aucune. Une action qui matche est comptée comme vide.
 */
const CONTENTLESS_PATTERNS: RegExp[] = [
  /^renseigner (les|vos) informations( demandees)?$/,
  /^remplir le formulaire$/,
  /^valider (votre|la) saisie$/,
  /^attendre (la|une) reponse$/,
  /^joindre (les|vos) justificatifs$/,
  /^suivre (la|les) procedures?( adaptees)?$/,
  /^se connecter( a son compte)?$/,
  /^creer un compte$/,
  /^cliquer sur .{0,20}$/,
  /^consulter le site( internet)?$/,
];

/** Au-delà de cette part d'actions vides, l'extraction n'apporte plus rien. */
export const MAX_CONTENTLESS_RATIO = 0.4;

/** Au-delà de ce nombre de mots, une phrase n'est plus un libellé de menu. */
const MAX_NAVIGATION_WORDS = 4;

/** Part d'items ressemblant à des entrées de menu au-delà de laquelle on alerte. */
export const MAX_NAVIGATION_RATIO = 0.5;

function normalizeAction(action: string): string {
  return normalizeForMatch(action).replace(/\s+/g, ' ').trim();
}

/** Actions réduites à une étape de formulaire générique. */
export function contentlessActions(actions: string[]): string[] {
  return (actions ?? []).filter((a) => {
    const n = normalizeAction(a);
    return CONTENTLESS_PATTERNS.some((re) => re.test(n));
  });
}

/**
 * Libellés de navigation : phrases brèves SANS objet précis — ni référence chiffrée,
 * ni ponctuation interne, quatre mots au plus. C'est la signature d'un menu scrapé
 * (« Trouver sa formation », « Préparer son arrivée », « Ouvrir un compte bancaire »),
 * là où une vraie tâche nomme son objet et dépasse ce gabarit.
 */
export function navigationLikeActions(actions: string[]): string[] {
  return (actions ?? []).filter((a) => {
    const bare = (a ?? '').trim().replace(/\.$/, '');
    if (!bare) return false;
    if (/\d/.test(bare) || /[,:;!?()]/.test(bare)) return false;
    return bare.split(/\s+/).length <= MAX_NAVIGATION_WORDS;
  });
}

/** Nombre de termes d'une catégorie présents dans un texte normalisé. */
function vocabularyHits(text: string, category: string): number {
  const vocab = CATEGORY_VOCABULARY[category] ?? [];
  return vocab.filter((term) => text.includes(term)).length;
}

/**
 * Catégorie dont le vocabulaire domine le texte, si elle n'est pas celle annoncée.
 * Il faut une marge STRICTE : à égalité on ne conclut rien, les thèmes se recoupent
 * légitimement (un titre de séjour mentionne l'emploi, et c'est normal).
 */
export function dominantForeignCategory(
  text: string,
  declared: string,
): { category: string; hits: number } | null {
  const declaredHits = vocabularyHits(text, declared);
  let best: { category: string; hits: number } | null = null;

  for (const category of Object.keys(CATEGORY_VOCABULARY)) {
    if (category === declared) continue;
    const hits = vocabularyHits(text, category);
    if (hits > declaredHits + 1 && (!best || hits > best.hits)) {
      best = { category, hits };
    }
  }
  return best;
}

/**
 * Verdict du linter. Chaque drapeau est une phrase que l'admin peut lire sans
 * connaître le pipeline — c'est ce texte qui s'affiche dans l'écran de génération.
 */
export function lintExtraction(input: LintInput): LintVerdict {
  const flags: string[] = [];
  const facts = input.facts ?? [];
  const actions = input.actions ?? [];
  const text = normalizeForMatch([...facts, ...actions].join(' '));
  const category = input.category;

  // 1. Hors-sujet — le thème annoncé est absent du contenu extrait.
  if (text && CATEGORY_VOCABULARY[category]) {
    if (vocabularyHits(text, category) === 0) {
      flags.push(
        `aucun terme de la catégorie « ${category} » dans le contenu extrait`,
      );
    }
    const foreign = dominantForeignCategory(text, category);
    if (foreign) {
      flags.push(
        `contenu relevant plutôt de « ${foreign.category} » que de « ${category} »`,
      );
    }
  }

  // 2. Vacuité — trop d'étapes de formulaire génériques.
  if (actions.length) {
    const empty = contentlessActions(actions);
    if (empty.length / actions.length > MAX_CONTENTLESS_RATIO) {
      flags.push(
        `${empty.length}/${actions.length} actions sans contenu utile (étapes de formulaire génériques)`,
      );
    }

    // 3. Navigation — le menu du site a été pris pour une liste de tâches.
    const nav = navigationLikeActions(actions);
    if (nav.length / actions.length > MAX_NAVIGATION_RATIO) {
      flags.push(
        `${nav.length}/${actions.length} actions ressemblent à des entrées de menu, pas à des tâches`,
      );
    }
  }

  // 4. Dispositif inadapté au public — règle AME préexistante, conservée.
  if (category === 'sante' && /\bame\b|aide medicale d etat/.test(text)) {
    flags.push(
      "mention de l'AME (réservée aux sans-papiers) — un expatrié avec visa relève de la PUMa",
    );
  }

  // 5. Procédure de niche présentée comme démarche générale — cas réel : la page
  //    « regroupement familial » (N11165) publiée pour « demarches-admin », alors
  //    qu'elle ne concerne que les expatriés qui font venir leur famille.
  if (actions.length) {
    const familyActions = actions.filter((a) =>
      normalizeForMatch(a).includes('regroupement familial'),
    );
    if (familyActions.length / actions.length > 0.5) {
      flags.push(
        `${familyActions.length}/${actions.length} actions portent sur le regroupement familial — dispositif réservé aux familles, pas une démarche générale`,
      );
    }
  }

  return { flags };
}
