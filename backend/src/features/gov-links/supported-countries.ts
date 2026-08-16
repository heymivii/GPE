/**
 * SINGLE SOURCE OF TRUTH for the countries the gov-links engine can process.
 *
 * Everything country-related in this feature derives from this registry:
 *   - SUPPORTED_COUNTRIES (controller validation)
 *   - official domain suffixes (allowlist, official-domains.ts)
 *   - display name (GovLinksService.countryName)
 *   - the admin UI country buttons (GET /gov-links/supported-countries)
 *
 * To support a new country: add ONE entry here + a search-hint seed for its categories.
 */
export interface SupportedCountryInfo {
  code: string;
  name: string;
  flag: string;
  /** Official / authoritative domain suffixes (hostname suffix match with dot boundary). */
  officialSuffixes: string[];
}

export const SUPPORTED_COUNTRIES = ['FR', 'US', 'JP', 'CH'] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export const SUPPORTED_COUNTRY_REGISTRY: Record<
  SupportedCountry,
  SupportedCountryInfo
> = {
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    officialSuffixes: [
      'gouv.fr',
      'service-public.fr',
      'ameli.fr',
      'campusfrance.org',
    ],
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    officialSuffixes: ['.gov', 'uscis.gov', 'state.gov'],
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    officialSuffixes: ['go.jp', 'moj.go.jp', 'isa.go.jp'],
  },
  CH: {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    officialSuffixes: ['admin.ch', 'ch.ch'],
  },
};

/** Display name for a supported country (falls back to the raw code). */
export function countryDisplayName(code: string): string {
  return (
    SUPPORTED_COUNTRY_REGISTRY[code.toUpperCase() as SupportedCountry]?.name ??
    code
  );
}

/** The public shape served to the admin UI (no allowlist internals). */
export function listSupportedCountries(): Array<{
  code: string;
  name: string;
  flag: string;
}> {
  return SUPPORTED_COUNTRIES.map((c) => {
    const { code, name, flag } = SUPPORTED_COUNTRY_REGISTRY[c];
    return { code, name, flag };
  });
}
