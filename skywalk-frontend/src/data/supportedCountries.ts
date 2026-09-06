export interface SupportedCountry {
    code: string;
    name: string;
    slug: string;
    flag: string;
    iso3: string;
    /** Code ISO 3166-1 numérique — identifiant des features du topojson world-atlas.
     *  Optionnel : les pays dérivés dynamiquement de la BDD ne l'ont pas et ne sont
     *  simplement pas illuminés sur la carte monde. */
    isoNumeric?: string;
    i18nKey: string;
    apiCity: string;
    apiCountryName: string;
}

export const SUPPORTED_COUNTRIES: SupportedCountry[] = [
    { code: 'FR', iso3: 'FRA', isoNumeric: '250', name: 'France', slug: 'france', flag: '🇫🇷', i18nKey: 'countries.france', apiCity: 'Paris', apiCountryName: 'France' },
    { code: 'US', iso3: 'USA', isoNumeric: '840', name: 'États-Unis', slug: 'etats-unis', flag: '🇺🇸', i18nKey: 'countries.unitedStates', apiCity: 'New York', apiCountryName: 'United States' },
    { code: 'JP', iso3: 'JPN', isoNumeric: '392', name: 'Japon', slug: 'japon', flag: '🇯🇵', i18nKey: 'countries.japan', apiCity: 'Tokyo', apiCountryName: 'Japan' },
    { code: 'CH', iso3: 'CHE', isoNumeric: '756', name: 'Suisse', slug: 'suisse', flag: '🇨🇭', i18nKey: 'countries.switzerland', apiCity: 'Geneva', apiCountryName: 'Switzerland' },
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
    'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
    'États-Unis': ['New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
    'Japon': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo'],
    'Suisse': ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern'],
};

export const SUPPORTED_COUNTRY_CODES = SUPPORTED_COUNTRIES.map(c => c.code);
export const SUPPORTED_COUNTRY_NAMES = SUPPORTED_COUNTRIES.map(c => c.name);
export const SUPPORTED_COUNTRY_SLUGS = SUPPORTED_COUNTRIES.map(c => c.slug);

export const ISO2_TO_ISO3: Record<string, string> = Object.fromEntries(
    SUPPORTED_COUNTRIES.map(c => [c.code, c.iso3]),
);

export const ISO3_TO_ISO2: Record<string, string> = Object.fromEntries(
    SUPPORTED_COUNTRIES.map(c => [c.iso3, c.code]),
);

export const COUNTRY_CITY_MAP: Record<string, { city: string; country: string; displayName: string }> =
    Object.fromEntries(
        SUPPORTED_COUNTRIES.map(c => [
            c.slug,
            { city: c.apiCity, country: c.apiCountryName, displayName: c.name },
        ]),
    );

const DEFAULT_MAPPING = COUNTRY_CITY_MAP['france'];

export function getCountryMapping(countrySlug: string | undefined | null) {
    const key = countrySlug || 'france';
    return COUNTRY_CITY_MAP[key] || DEFAULT_MAPPING;
}

/**
 * Sous-tag de langue, à partir de n'importe quelle étiquette BCP-47.
 *
 * `i18n.language` porte l'étiquette complète fournie par le détecteur de
 * navigateur (« fr-FR », « en-GB »), pas le code court sous lequel les
 * ressources sont enregistrées. Comparer `language === 'fr'` échouait donc
 * silencieusement et basculait sur la branche anglaise : les dates du blog
 * s'affichaient « February 5, 2026 » en pleine interface française.
 */
export function getLang(lang?: string | null): 'fr' | 'en' {
    return (lang ?? '').split('-')[0].toLowerCase() === 'fr' ? 'fr' : 'en';
}

export function getLocale(lang?: string | null): string {
    return getLang(lang) === 'fr' ? 'fr-FR' : 'en-US';
}

export function getCurrentLocale(): string {
    try {
        const lang = document.documentElement.lang || navigator.language.slice(0, 2);
        return getLocale(lang);
    } catch {
        return 'fr-FR';
    }
}
