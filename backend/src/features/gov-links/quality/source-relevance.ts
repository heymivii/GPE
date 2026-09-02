/**
 * PERTINENCE DE LA SOURCE — 1ᵉʳ garde-fou du pipeline gov-links.
 *
 * `isOfficialDomain` répond à « ce domaine est-il officiel ? ». C'est nécessaire mais
 * très insuffisant : trois pages parfaitement officielles peuvent être de mauvaises
 * sources pour une checklist d'expatriation.
 *
 *   1. PORTÉE — une page départementale/cantonale présentée comme la procédure
 *      nationale. Cas réel : `demarche.numerique.gouv.fr/commencer/pref14-…`
 *      (pref14 = préfecture du Calvados) servie à un projet visant Paris, avec
 *      l'adresse `pref-etrangers@calvados.gouv.fr` recopiée dans les tâches.
 *   2. SENS — une page qui parle des ressortissants QUI PARTENT (« Français de
 *      l'étranger ») alors que l'utilisateur ARRIVE dans le pays.
 *   3. PUBLIC — un portail entreprises/professionnels pour une démarche de
 *      particulier. Cas réel : `entreprendre.service-public.gouv.fr` comme source
 *      de l'étape « Démarches administratives ».
 *
 * Un verdict négatif ne supprime rien : il bascule le lien en `needs_review`, donc
 * sous les yeux d'un humain. C'est le bon mode d'échec — la machine dit « je ne sais
 * pas certifier », pas « c'est faux ».
 */

import { normalizeForMatch } from './grounding';

export interface RelevanceInput {
  countryCode: string;
  category: string;
  url: string | null;
  label?: string | null;
  facts?: string[];
  actions?: string[];
  pageText?: string | null;
}

export interface RelevanceVerdict {
  ok: boolean;
  /** 'incoming' = la page s'adresse à qui arrive ; 'outgoing' = à qui part. */
  direction: 'incoming' | 'outgoing' | null;
  /** Public visé détecté : particulier, entreprise, ou collectivité locale. */
  audience: 'individual' | 'business' | 'local' | null;
  reason: string | null;
}

/**
 * Portails NATIONAUX connus, par pays. Tout autre hôte officiel est traité comme
 * potentiellement local — volontairement conservateur : un faux positif coûte une
 * relecture humaine, un faux négatif expédie un expatrié à la mauvaise préfecture.
 */
const NATIONAL_HOSTS: Record<string, string[]> = {
  FR: [
    'service-public.fr',
    'service-public.gouv.fr',
    'demarche.numerique.gouv.fr',
    'france-visas.gouv.fr',
    'interieur.gouv.fr',
    'immigration.interieur.gouv.fr',
    'diplomatie.gouv.fr',
    'travail-emploi.gouv.fr',
    'economie.gouv.fr',
    'impots.gouv.fr',
    'education.gouv.fr',
    'enseignementsup-recherche.gouv.fr',
    'sante.gouv.fr',
    'ameli.fr',
    'campusfrance.org',
    'urssaf.fr',
    'francetravail.fr',
  ],
  CH: ['admin.ch', 'ch.ch', 'sem.admin.ch', 'bag.admin.ch'],
  US: [
    'uscis.gov',
    'state.gov',
    'travel.state.gov',
    'ssa.gov',
    'irs.gov',
    'usa.gov',
  ],
  JP: ['moj.go.jp', 'isa.go.jp', 'mhlw.go.jp', 'mofa.go.jp', 'jasso.go.jp'],
};

/**
 * Marqueurs d'URL infra-nationaux. Le jeton `pref\d+` est le plus décisif pour la
 * France : c'est l'identifiant de département dans les formulaires de l'État.
 */
const LOCAL_URL_PATTERNS: Record<string, RegExp[]> = {
  FR: [
    /\bpref\d{1,3}\b/i,
    /\bprefecture\b/i,
    /\bmairie\b/i,
    /\bdepartement-?\d{2,3}\b/i,
  ],
  CH: [/\bkanton\b/i, /\bcanton\b/i, /\bgemeinde\b/i, /\bcommune\b/i],
  US: [/\bcounty\b/i, /\bcity-of\b/i, /\bstate\.[a-z]{2}\./i],
  JP: [/\.lg\.jp/i, /\bcity\./i, /\bpref\.[a-z]+\.jp/i],
};

/**
 * Pages communautaires : un sous-domaine forum/blog d'un site officiel reste dans
 * l'allowlist (`forum-assures.ameli.fr` finit bien par `.ameli.fr`) mais n'est JAMAIS
 * une source de procédure — cas réel : un fil de forum ameli élu pour « sante », avec
 * des « actions » extraites d'une conversation privée.
 */
const COMMUNITY_URL_PATTERNS = [
  /^forum[s]?[.-]/i,
  /[.-]forum[s]?\./i,
  /\/forum[s]?\//i,
  /^community\./i,
  /^blog\./i,
  /\/blog\//i,
];

function isCommunityUrl(url: string, host: string): boolean {
  return COMMUNITY_URL_PATTERNS.some((re) => re.test(host) || re.test(url));
}

/** Portails destinés aux entreprises / professionnels, pas aux particuliers. */
const BUSINESS_HOST_PATTERNS = [
  /^entreprendre\./i,
  /^entreprises?\./i,
  /^business\./i,
  /^pro\./i,
];
const BUSINESS_PATH_PATTERNS = [
  /\/professionnels?\//i,
  /\/entreprises?\//i,
  /\/business\//i,
];

/** Catégories qui s'adressent par nature à une entreprise — le public « business » y est normal. */
const BUSINESS_CATEGORIES = new Set(['business']);

/** Formulations trahissant une page destinée aux ressortissants QUI QUITTENT le pays. */
const OUTGOING_MARKERS = [
  'francais de l etranger',
  'francais etablis hors de france',
  's expatrier',
  'quitter la france',
  'expatriation des francais',
  'citizens abroad',
  'nationals abroad',
  'living abroad',
  'moving abroad',
];

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isNationalHost(host: string, countryCode: string): boolean {
  const known = NATIONAL_HOSTS[countryCode.toUpperCase()] ?? [];
  return known.some((h) => host === h || host.endsWith(`.${h}`));
}

/** Une URL est infra-nationale si un marqueur local apparaît, ou si l'hôte officiel est inconnu. */
export function isSubNationalUrl(
  url: string | null,
  countryCode: string,
): { local: boolean; marker: string | null } {
  const host = hostOf(url);
  if (!host || !url) return { local: false, marker: null };

  const patterns = LOCAL_URL_PATTERNS[countryCode.toUpperCase()] ?? [];
  const hit = patterns.find((re) => re.test(url));
  if (hit) return { local: true, marker: hit.source };

  // Hôte officiel mais absent du registre national → périmètre indéterminé.
  if (!isNationalHost(host, countryCode)) return { local: true, marker: host };

  return { local: false, marker: null };
}

/**
 * Coordonnée d'une autorité LOCALE recopiée dans le contenu : c'est la fuite exacte du
 * cas Calvados (`pref-etrangers@calvados.gouv.fr` dans une action). On ne regarde que
 * les emails sur un domaine officiel du pays mais hors portails nationaux.
 */
export function localContactLeak(
  texts: Array<string | null | undefined>,
  countryCode: string,
  officialSuffixes: string[],
): string | null {
  const joined = (texts ?? []).filter(Boolean).join(' ');
  const emails =
    joined.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
  for (const email of emails) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) continue;
    const isOfficial = officialSuffixes.some((sfx) => {
      const bare = sfx.replace(/^\./, '');
      return domain === bare || domain.endsWith(`.${bare}`);
    });
    if (isOfficial && !isNationalHost(domain, countryCode)) return email;
  }
  return null;
}

/** La page s'adresse-t-elle à qui PART plutôt qu'à qui ARRIVE ? */
export function detectDirection(
  texts: Array<string | null | undefined>,
): 'incoming' | 'outgoing' {
  const hay = normalizeForMatch((texts ?? []).filter(Boolean).join(' '));
  return OUTGOING_MARKERS.some((m) => hay.includes(m))
    ? 'outgoing'
    : 'incoming';
}

/** Public visé d'après l'URL : entreprise, collectivité locale, ou particulier. */
export function detectAudience(
  url: string | null,
  countryCode: string,
): 'individual' | 'business' | 'local' {
  const host = hostOf(url);
  if (!host || !url) return 'individual';
  if (
    BUSINESS_HOST_PATTERNS.some((re) => re.test(host)) ||
    BUSINESS_PATH_PATTERNS.some((re) => re.test(url))
  ) {
    return 'business';
  }
  if (isSubNationalUrl(url, countryCode).local) return 'local';
  return 'individual';
}

/**
 * Verdict composite. Chaque règle qui échoue produit une raison lisible par l'admin :
 * le but est qu'il comprenne en une phrase POURQUOI le lien est en attente.
 */
export interface RelevanceOptions {
  /**
   * URL choisie et vouchée par un admin (pinnedUrl) : les contrôles fondés sur l'URL
   * (portée nationale, portail entreprises) s'inclinent — l'humain a tranché. Cas
   * légitime : le permis de conduire américain vit au niveau de l'ÉTAT (DMV), un
   * admin doit pouvoir épingler un site étatique. Les contrôles fondés sur le
   * CONTENU (fuite de coordonnées locales, sens de lecture) restent actifs.
   */
  trustedSource?: boolean;
}

export function checkSourceRelevance(
  input: RelevanceInput,
  officialSuffixes: string[] = [],
  options: RelevanceOptions = {},
): RelevanceVerdict {
  const { countryCode, category, url } = input;
  if (!url) {
    return { ok: false, direction: null, audience: null, reason: 'aucune URL' };
  }

  const reasons: string[] = [];
  const contentTexts = [
    ...(input.facts ?? []),
    ...(input.actions ?? []),
    input.label ?? '',
  ];

  // Une page communautaire n'est jamais une procédure — même épinglée, on préfère
  // le signaler : c'est presque à coup sûr une erreur de saisie de l'admin.
  const host = new URL(url).hostname.toLowerCase();
  if (isCommunityUrl(url, host)) {
    reasons.push(
      'page communautaire (forum/blog) — pas une source de procédure officielle',
    );
  }

  const scope = isSubNationalUrl(url, countryCode);
  if (scope.local && !options.trustedSource) {
    reasons.push(
      `source non nationale (${scope.marker}) — une procédure locale ne vaut pas pour tout le pays`,
    );
  }

  const leak = localContactLeak(contentTexts, countryCode, officialSuffixes);
  if (leak) {
    reasons.push(`coordonnée d'une autorité locale dans le contenu (${leak})`);
  }

  // Sens de lecture : on ne scanne que le contenu EXTRAIT et l'entame de la page (où
  // elle déclare son public) — pas ses 20 000 caractères. Un simple lien de pied de
  // page « Français de l'étranger » ne doit pas disqualifier une bonne page nationale.
  const direction = detectDirection([
    ...contentTexts,
    (input.pageText ?? '').slice(0, 2000),
  ]);
  if (direction === 'outgoing') {
    reasons.push(
      "page destinée aux ressortissants qui QUITTENT le pays, pas à qui s'y installe",
    );
  }

  const audience = detectAudience(url, countryCode);
  if (
    audience === 'business' &&
    !BUSINESS_CATEGORIES.has(category) &&
    !options.trustedSource
  ) {
    reasons.push(
      `portail entreprises pour une démarche de particulier (catégorie « ${category} »)`,
    );
  }

  return {
    ok: reasons.length === 0,
    direction,
    audience,
    reason: reasons.length ? reasons.join(' · ') : null,
  };
}
