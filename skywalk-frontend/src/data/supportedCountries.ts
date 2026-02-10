export interface SupportedCountry {
    code: string;
    name: string;
    slug: string;
    flag: string;
    /** ISO 3166-1 alpha-3 code (e.g. "FRA") */
    iso3: string;
    /** i18n key under "countries.*" used for display */
    i18nKey: string;
    /** City name used for the cost-of-living API (English) */
    apiCity: string;
    /** Country name used for the cost-of-living API (English) */
    apiCountryName: string;
}

export const SUPPORTED_COUNTRIES: SupportedCountry[] = [
    { code: 'FR', iso3: 'FRA', name: 'France', slug: 'france', flag: '🇫🇷', i18nKey: 'countries.france', apiCity: 'Paris', apiCountryName: 'France' },
    { code: 'US', iso3: 'USA', name: 'États-Unis', slug: 'etats-unis', flag: '🇺🇸', i18nKey: 'countries.unitedStates', apiCity: 'New York', apiCountryName: 'United States' },
    { code: 'JP', iso3: 'JPN', name: 'Japon', slug: 'japon', flag: '🇯🇵', i18nKey: 'countries.japan', apiCity: 'Tokyo', apiCountryName: 'Japan' },
    { code: 'CH', iso3: 'CHE', name: 'Suisse', slug: 'suisse', flag: '🇨🇭', i18nKey: 'countries.switzerland', apiCity: 'Geneva', apiCountryName: 'Switzerland' },
] as const;

export const SUPPORTED_COUNTRY_CODES = SUPPORTED_COUNTRIES.map(c => c.code);
export const SUPPORTED_COUNTRY_NAMES = SUPPORTED_COUNTRIES.map(c => c.name);
export const SUPPORTED_COUNTRY_SLUGS = SUPPORTED_COUNTRIES.map(c => c.slug);

/** ISO-2 → ISO-3 mapping (e.g. "FR" → "FRA") */
export const ISO2_TO_ISO3: Record<string, string> = Object.fromEntries(
    SUPPORTED_COUNTRIES.map(c => [c.code, c.iso3]),
);

/** ISO-3 → ISO-2 mapping (e.g. "FRA" → "FR") */
export const ISO3_TO_ISO2: Record<string, string> = Object.fromEntries(
    SUPPORTED_COUNTRIES.map(c => [c.iso3, c.code]),
);

/** Lookup by slug → { city, country, displayName } for cost-of-living API calls */
export const COUNTRY_CITY_MAP: Record<string, { city: string; country: string; displayName: string }> =
    Object.fromEntries(
        SUPPORTED_COUNTRIES.map(c => [
            c.slug,
            { city: c.apiCity, country: c.apiCountryName, displayName: c.name },
        ]),
    );

const DEFAULT_MAPPING = COUNTRY_CITY_MAP['france'];

/**
 * Resolve country mapping from a slug (or null).
 * Falls back to France if slug is unknown.
 */
export function getCountryMapping(countrySlug: string | undefined | null) {
    const key = countrySlug || 'france';
    return COUNTRY_CITY_MAP[key] || DEFAULT_MAPPING;
}

/**
 * Convert an i18n language code to a full BCP-47 locale string.
 * @example getLocale('fr') → 'fr-FR'
 * @example getLocale('en') → 'en-US'
 */
export function getLocale(lang: string): string {
    return lang === 'fr' ? 'fr-FR' : 'en-US';
}

/**
 * Get the current user locale from the i18n singleton.
 * Works outside of React components (module-level helpers, etc.).
 */
export function getCurrentLocale(): string {
    try {
        const lang = document.documentElement.lang || navigator.language.slice(0, 2);
        return getLocale(lang);
    } catch {
        return 'fr-FR';
    }
}
