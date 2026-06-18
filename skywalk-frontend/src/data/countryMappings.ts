/**
 * countryMappings.ts
 *
 * Single normalisation module for country representations.
 * All lookup logic derives from a mutable registry seeded with SUPPORTED_COUNTRIES.
 * Call hydrateCountries() to replace the registry with DB-fetched data; all
 * existing consumers automatically see the updated list (no re-import needed).
 */

import { SUPPORTED_COUNTRIES, type SupportedCountry } from './supportedCountries';

// ─── Pure helpers (no dependency on registry) ─────────────────────────────────

/**
 * Convert an ISO2 code to its regional-indicator flag emoji.
 * Each letter maps to the regional indicator symbol letters U+1F1E6–U+1F1FF.
 * Returns '' for any invalid input (not exactly 2 ASCII letters).
 */
export function flagEmoji(iso2: string): string {
    if (!iso2 || iso2.length !== 2) return '';
    const a = iso2.toUpperCase().charCodeAt(0);
    const b = iso2.toUpperCase().charCodeAt(1);
    if (a < 65 || a > 90 || b < 65 || b > 90) return '';
    return String.fromCodePoint(0x1F1E6 + (a - 65), 0x1F1E6 + (b - 65));
}

/**
 * Slugify a country name: lowercase, strip diacritics, spaces/underscores → '-',
 * remove non-alphanumeric-hyphen characters.
 * Examples: 'France' → 'france', 'États-Unis' → 'etats-unis',
 *           'Japon' → 'japon', 'Suisse' → 'suisse'.
 */
export function slugify(name: string): string {
    return name
        .normalize('NFD')                    // decompose diacritics
        .replace(/[̀-ͯ]/g, '')    // strip combining diacritical marks
        .toLowerCase()
        .replace(/['‘’ʼ]/g, '-') // apostrophes → hyphen (d'Ivoire → d-ivoire)
        .replace(/[\s_]+/g, '-')             // spaces/underscores → hyphen
        .replace(/[^a-z0-9-]/g, '')         // remove anything else
        .replace(/-{2,}/g, '-')              // collapse consecutive hyphens
        .replace(/^-+|-+$/g, '');            // trim leading/trailing hyphens
}

// ─── Mutable registry (seeded with the static list) ───────────────────────────

let _registry: SupportedCountry[] = [...SUPPORTED_COUNTRIES];

// Internal lookup maps, rebuilt whenever the registry changes.
let _bySlug   = new Map<string, SupportedCountry>();
let _byCode   = new Map<string, SupportedCountry>(); // lower-cased ISO2
let _byName   = new Map<string, SupportedCountry>(); // French name (lower)
let _byApiName = new Map<string, SupportedCountry>(); // apiCountryName (lower)

function _rebuildMaps(list: SupportedCountry[]): void {
    _bySlug    = new Map();
    _byCode    = new Map();
    _byName    = new Map();
    _byApiName = new Map();
    for (const c of list) {
        _bySlug.set(c.slug.toLowerCase(), c);
        _byCode.set(c.code.toLowerCase(), c);
        _byName.set(c.name.toLowerCase(), c);
        _byApiName.set(c.apiCountryName.toLowerCase(), c);
    }
}

// Seed the maps on module load.
_rebuildMaps(_registry);

/**
 * Replace the country registry with a new list (e.g. fetched from the backend).
 * All subsequent calls to resolveCountry / slugFromCode / etc. reflect the new list.
 * Callers that have already destructured values (e.g. const x = resolveCountry('fr'))
 * are unaffected; only future calls change.
 */
export function hydrateCountries(list: SupportedCountry[]): void {
    _registry = list;
    _rebuildMaps(list);
}

/** Read-only snapshot of the current registry (seed or hydrated). */
export function getRegistry(): readonly SupportedCountry[] {
    return _registry;
}

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Resolve any representation (slug, ISO2 code, French name, English API name)
 * to a SupportedCountry record. Case-insensitive. Returns undefined when unknown.
 */
export function resolveCountry(input: string | null | undefined): SupportedCountry | undefined {
    if (!input) return undefined;
    const key = input.toLowerCase().trim();
    return (
        _bySlug.get(key) ??
        _byCode.get(key) ??
        _byName.get(key) ??
        _byApiName.get(key)
    );
}

// ─── Convenience helpers ───────────────────────────────────────────────────────

/** ISO2 code (e.g. 'FR') from a slug (e.g. 'france'). Returns undefined when unknown. */
export function codeFromSlug(slug: string | null | undefined): string | undefined {
    return resolveCountry(slug)?.code;
}

/** Slug (e.g. 'france') from an ISO2 code (e.g. 'FR'). Returns undefined when unknown. */
export function slugFromCode(code: string | null | undefined): string | undefined {
    return resolveCountry(code)?.slug;
}

/**
 * Display name (apiCountryName, e.g. 'France', 'United States') from an ISO2 code.
 * Returns undefined when unknown.
 */
export function nameFromCode(code: string | null | undefined): string | undefined {
    return resolveCountry(code)?.apiCountryName;
}

/** ISO2 code from a country name (French or English). Returns undefined when unknown. */
export function codeFromName(name: string | null | undefined): string | undefined {
    return resolveCountry(name)?.code;
}

// ─── Adzuna provider codes ─────────────────────────────────────────────────────
//
// Adzuna uses lower-cased ISO2 for its 4 supported countries.
// The remaining slugs (unsupported in SUPPORTED_COUNTRIES) keep their explicit codes.
// These maps are static (Adzuna has a fixed country list) and do NOT change on hydration.

/** ISO2 (lower) → Adzuna country code. */
export const ISO2_TO_ADZUNA: Record<string, string> = Object.fromEntries(
    SUPPORTED_COUNTRIES.map(c => [c.code.toLowerCase(), c.code.toLowerCase()])
);

/**
 * Slug → Adzuna country code.
 * Supported countries are derived; the remaining are explicit overrides.
 * Preserves every code from the original SLUG_TO_ADZUNA in EmploiStats.
 */
export const SLUG_TO_ADZUNA_CODE: Record<string, string> = {
    // Derived from SUPPORTED_COUNTRIES (slug → code.toLowerCase())
    ...Object.fromEntries(SUPPORTED_COUNTRIES.map(c => [c.slug, c.code.toLowerCase()])),
    // Explicit codes for countries not in SUPPORTED_COUNTRIES
    'royaume-uni': 'gb',
    canada: 'ca',
    allemagne: 'de',
    espagne: 'es',
    italie: 'it',
    belgique: 'be',
    'pays-bas': 'nl',
    australie: 'au',
    'nouvelle-zelande': 'nz',
    bresil: 'br',
    mexique: 'mx',
    singapour: 'sg',
};

/**
 * Resolve Adzuna country code from a slug.
 * Returns undefined when the slug has no Adzuna mapping (e.g. Japon / 'jp' is not
 * supported by Adzuna — matches original behaviour where `adzunaCode` was undefined).
 */
export function adzunaCodeFromSlug(slug: string | null | undefined): string | undefined {
    if (!slug) return undefined;
    const code = SLUG_TO_ADZUNA_CODE[slug.toLowerCase()];
    // Japon ('jp') is technically in the map because it's in SUPPORTED_COUNTRIES,
    // but Adzuna does not support JP — preserve original behaviour.
    const ADZUNA_UNSUPPORTED = new Set(['jp']);
    if (code && ADZUNA_UNSUPPORTED.has(code)) return undefined;
    return code;
}
