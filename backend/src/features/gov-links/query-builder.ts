/** ISO2 country codes whose official pages are primarily in French. */
const FRENCH_COUNTRIES = new Set(['FR', 'CH', 'BE', 'LU', 'MC', 'SN', 'CI',
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
  'NC']);

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
    fr: { terms: 'demande visa long séjour consulat',                        keywords: ['visa', 'long séjour', 'consulat'] },
    en: { terms: 'long-stay visa application consulate',                     keywords: ['visa', 'immigration'] },
  },
  demarches: {
    fr: { terms: 'titre de séjour carte de séjour démarches étranger',      keywords: ['titre séjour', 'carte séjour', 'étranger'] },
    en: { terms: 'residence permit application foreigner official',          keywords: ['residence', 'permit', 'immigration'] },
  },
  'demarches-admin': {
    fr: { terms: 'démarches administratives officielles étranger',           keywords: ['démarches', 'administration', 'officiel'] },
    en: { terms: 'official administrative procedures foreigner',             keywords: ['administration', 'official'] },
  },
  logement: {
    fr: { terms: 'se loger louer logement locataire étranger',               keywords: ['logement', 'louer', 'locataire'] },
    en: { terms: 'housing rental tenant foreigner official guide',           keywords: ['housing', 'rental'] },
  },
  sante: {
    fr: { terms: 'affiliation assurance maladie sécurité sociale étranger', keywords: ['assurance maladie', 'sécurité sociale', 'CPAM'] },
    en: { terms: 'health insurance social security coverage foreigner',      keywords: ['health', 'insurance'] },
  },
  emploi: {
    fr: { terms: 'travailler permis de travail salarié étranger',           keywords: ['permis travail', 'salarié', 'étranger'] },
    en: { terms: 'work permit employment authorization foreigner',           keywords: ['work', 'employment'] },
  },
  banque: {
    fr: { terms: 'ouvrir un compte bancaire étranger',                      keywords: ['compte bancaire', 'banque', 'ouverture'] },
    en: { terms: 'open bank account foreigner official',                     keywords: ['bank', 'account'] },
  },
  transport: {
    fr: { terms: 'échanger permis de conduire étranger France',             keywords: ['permis conduire', 'échange', 'transport'] },
    en: { terms: 'exchange foreign driving licence official',                keywords: ['driving licence', 'transport'] },
  },
  education: {
    fr: { terms: 'inscription études étudiant étranger université',         keywords: ['inscription', 'étudiant', 'études'] },
    en: { terms: 'enrollment foreign student university official',           keywords: ['education', 'enrollment'] },
  },
  culture: {
    fr: { terms: 'vie culturelle et associative étranger',                  keywords: ['culture', 'associations'] },
    en: { terms: 'cultural life community foreigner official',               keywords: ['culture', 'community'] },
  },
  business: {
    fr: { terms: 'créer une entreprise s\'installer comme indépendant étranger', keywords: ['entreprise', 'indépendant', 'société'] },
    en: { terms: 'start a business self-employment foreigner official',      keywords: ['business', 'company', 'self-employed'] },
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
  const qualifier = lang === 'fr' ? 'site officiel' : 'official government site';
  return {
    query: `${countryName} ${terms} ${qualifier}`,
    keywords,
  };
}
