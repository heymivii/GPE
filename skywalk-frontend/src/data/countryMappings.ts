/**
 * countryMappings.ts
 *
 * Single normalisation module for country representations.
 * All logic derives from SUPPORTED_COUNTRIES — no duplicated data.
 */

import { SUPPORTED_COUNTRIES, type SupportedCountry } from './supportedCountries';

// ─── Lookup indices ────────────────────────────────────────────────────────────

const _bySlug = new Map<string, SupportedCountry>();
const _byCode = new Map<string, SupportedCountry>(); // lower-cased ISO2
const _byName = new Map<string, SupportedCountry>(); // French name (lower)
const _byApiName = new Map<string, SupportedCountry>(); // apiCountryName (lower)

for (const c of SUPPORTED_COUNTRIES) {
    _bySlug.set(c.slug.toLowerCase(), c);
    _byCode.set(c.code.toLowerCase(), c);
    _byName.set(c.name.toLowerCase(), c);
    _byApiName.set(c.apiCountryName.toLowerCase(), c);
}

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

/** ISO2 (lower) → Adzuna country code. For SUPPORTED_COUNTRIES this is always
 *  code.toLowerCase(); included here to make ISO2_TO_ADZUNA a stable, typed map. */
export const ISO2_TO_ADZUNA: Record<string, string> = Object.fromEntries(
    SUPPORTED_COUNTRIES.map(c => [c.code.toLowerCase(), c.code.toLowerCase()])
);
// Note: Adzuna uses 'gb' for the UK (not in SUPPORTED_COUNTRIES); that mapping lives
// in the explicit slug table below.

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
    // but Adzuna does not support JP — preserve original behaviour: if the derived
    // code isn't in Adzuna's actual supported set, return undefined.
    // Original SLUG_TO_ADZUNA did NOT include 'japon', so we mirror that.
    const ADZUNA_UNSUPPORTED = new Set(['jp']);
    if (code && ADZUNA_UNSUPPORTED.has(code)) return undefined;
    return code;
}
