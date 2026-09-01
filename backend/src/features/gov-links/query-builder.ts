/** ISO2 country codes whose official pages are primarily in French. */
const FRENCH_COUNTRIES = new Set([
  'FR',
  'CH',
  'BE',
  'LU',
  'MC',
  'SN',
  'CI',
  'CM',
  'ML',
  'BF',
  'NE',
  'TG',
  'BJ',
  'GA',
  'CG',
  'CD',
  'MG',
  'MU',
  'SC',
  'KM',
  'DJ',
  'GN',
  'RW',
  'BI',
  'TD',
  'CF',
  'MR',
  'TN',
  'MA',
  'DZ',
  'HT',
  'VU',
  'NC',
]);

/** Map countryCode → query language ('fr' | 'en'). Default: 'en'. */
export const LANG_BY_COUNTRY: Record<string, 'fr' | 'en'> = Object.fromEntries(
  [...FRENCH_COUNTRIES].map((c) => [c, 'fr' as const]),
);

type CategoryEntry = {
  fr: { terms: string; keywords: string[] };
  en: { terms: string; keywords: string[] };
};

const CATEGORY_TERMS: Record<string, CategoryEntry> = {
  visa: {
    fr: {
      terms: 'demande visa long séjour consulat',
      keywords: ['visa', 'long séjour', 'consulat'],
    },
    en: {
      terms: 'long-stay visa application consulate',
      keywords: ['visa', 'immigration'],
    },
  },
  demarches: {
    fr: {
      terms: 'titre de séjour carte de séjour démarches étranger',
      keywords: ['titre séjour', 'carte séjour', 'étranger'],
    },
    en: {
      terms: 'residence permit application foreigner official',
      keywords: ['residence', 'permit', 'immigration'],
    },
  },
  'demarches-admin': {
    fr: {
      terms: 'démarches administratives officielles étranger',
      keywords: ['démarches', 'administration', 'officiel'],
    },
    en: {
      terms: 'official administrative procedures foreigner',
      keywords: ['administration', 'official'],
    },
  },
  logement: {
    fr: {
      terms: 'se loger louer logement locataire étranger',
      keywords: ['logement', 'louer', 'locataire'],
    },
    en: {
      terms: 'housing rental tenant foreigner official guide',
      keywords: ['housing', 'rental'],
    },
  },
  sante: {
    fr: {
      terms: 'affiliation assurance maladie sécurité sociale étranger',
      keywords: ['assurance maladie', 'sécurité sociale', 'CPAM'],
    },
    en: {
      terms: 'health insurance social security coverage foreigner',
      keywords: ['health', 'insurance'],
    },
  },
  emploi: {
    fr: {
      terms: 'travailler permis de travail salarié étranger',
      keywords: ['permis travail', 'salarié', 'étranger'],
    },
    en: {
      terms: 'work permit employment authorization foreigner',
      keywords: ['work', 'employment'],
    },
  },
  banque: {
    fr: {
      terms: 'ouvrir un compte bancaire étranger',
      keywords: ['compte bancaire', 'banque', 'ouverture'],
    },
    en: {
      terms: 'open bank account foreigner official',
      keywords: ['bank', 'account'],
    },
  },
  transport: {
    fr: {
      terms: 'échanger permis de conduire étranger France',
      keywords: ['permis conduire', 'échange', 'transport'],
    },
    en: {
      terms: 'exchange foreign driving licence official',
      keywords: ['driving licence', 'transport'],
    },
  },
  education: {
    fr: {
      terms: 'inscription études étudiant étranger université',
      keywords: ['inscription', 'étudiant', 'études'],
    },
    en: {
      terms: 'enrollment foreign student university official',
      keywords: ['education', 'enrollment'],
    },
  },
  culture: {
    fr: {
      terms: 'vie culturelle et associative étranger',
      keywords: ['culture', 'associations'],
    },
    en: {
      terms: 'cultural life community foreigner official',
      keywords: ['culture', 'community'],
    },
  },
  business: {
    fr: {
      terms: "créer une entreprise s'installer comme indépendant étranger",
      keywords: ['entreprise', 'indépendant', 'société'],
    },
    en: {
      terms: 'start a business self-employment foreigner official',
      keywords: ['business', 'company', 'self-employed'],
    },
  },
};

export function buildQuery(
  countryName: string,
  category: string,
  countryCode: string = '',
): { query: string; keywords: string[] } {
  const lang: 'fr' | 'en' = LANG_BY_COUNTRY[countryCode?.toUpperCase()] ?? 'en';
  const entry = CATEGORY_TERMS[category];

  if (!entry) {
    return {
      query: `${countryName} official government information`,
      keywords: [],
    };
  }

  const { terms, keywords } = entry[lang];
  const qualifier =
    lang === 'fr' ? 'site officiel' : 'official government site';
  return {
    query: `${countryName} ${terms} ${qualifier}`,
    keywords,
  };
}

// ── buildQueries v2 — fan-out driven by the editable search hint (pure; no DB access here) ──────

/** The subset of a SearchHint the pure builder needs (kept local to avoid importing the entity). */
export interface QueryHint {
  officialDomains: string[];
  keywords: string;
  queryLang: string;
  excludeTerms: string[];
}

/** Open-query "official site" qualifier per query language. */
const OFFICIAL_SUFFIX_BY_LANG: Record<string, string> = {
  fr: 'site officiel',
  en: 'official government site',
  ja: '公式サイト',
  de: 'offizielle Website',
};

/** CJK scripts (hiragana, katakana, kanji/han, compat ideographs): meaningful words are often 1-2 chars. */
const CJK_RE = /[぀-ヿ㐀-鿿豈-﫿]/;

/**
 * Keep a token for the relevance gate if it's >2 chars (Latin filler-word cutoff) OR contains
 * CJK — a universal `length > 2` filter would silently drop core Japanese terms like ビザ (visa).
 */
function isRelevanceToken(w: string): boolean {
  return w.length > 2 || (w.length > 0 && CJK_RE.test(w));
}

/** `-term` for a word, `-"multi word"` for a phrase. */
function excludeSuffix(terms: string[]): string {
  return (terms ?? [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (/\s/.test(t) ? `-"${t}"` : `-${t}`))
    .join(' ');
}

/**
 * Build the fan-out of search queries from a SearchHint:
 *   - one `site:<domain> <keywords>` query per officialDomain,
 *   - plus one open fallback query `<keywords> <officialSuffix(lang)>`,
 *   - each suffixed with the `-excludeTerm` operators,
 *   - all in `hint.queryLang`.
 * When `hint` is absent/empty → falls back to the generic single query (buildQuery), unchanged.
 * Pure: no DB access (the hint is fetched by GovLinksService).
 */
export function buildQueries(
  hint: QueryHint | null | undefined,
  fallback: { countryName: string; category: string; countryCode?: string },
): { queries: string[]; keywords: string[]; excludeTerms: string[] } {
  if (!hint || !hint.keywords?.trim()) {
    const g = buildQuery(
      fallback.countryName,
      fallback.category,
      fallback.countryCode ?? '',
    );
    return { queries: [g.query], keywords: g.keywords, excludeTerms: [] };
  }

  const kw = hint.keywords.trim();
  const exc = excludeSuffix(hint.excludeTerms ?? []);
  const tail = exc ? ` ${exc}` : '';
  const suffix =
    OFFICIAL_SUFFIX_BY_LANG[hint.queryLang] ?? OFFICIAL_SUFFIX_BY_LANG.en;

  const siteQueries = (hint.officialDomains ?? [])
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => `site:${d} ${kw}${tail}`);
  const openQuery = `${kw} ${suffix}${tail}`;

  // Token list for the LinkVerifier relevance check (substring match, as today).
  const keywords = kw
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(isRelevanceToken);

  return {
    queries: [...siteQueries, openQuery],
    keywords,
    excludeTerms: hint.excludeTerms ?? [],
  };
}
