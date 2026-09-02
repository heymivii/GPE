import { describe, it, expect, afterEach } from 'vitest';
import {
    resolveCountry,
    codeFromSlug,
    slugFromCode,
    nameFromCode,
    codeFromName,
    adzunaCodeFromSlug,
    SLUG_TO_ADZUNA_CODE,
    flagEmoji,
    slugify,
    hydrateCountries,
    getRegistry,
} from './countryMappings';

describe('flagEmoji', () => {
    it('converts ISO2 to regional-indicator flag emoji', () => {
        expect(flagEmoji('FR')).toBe('🇫🇷');
        expect(flagEmoji('US')).toBe('🇺🇸');
        expect(flagEmoji('JP')).toBe('🇯🇵');
        expect(flagEmoji('CH')).toBe('🇨🇭');
    });

    it('is case-insensitive', () => {
        expect(flagEmoji('fr')).toBe('🇫🇷');
        expect(flagEmoji('us')).toBe('🇺🇸');
    });

    it('returns empty string for invalid input', () => {
        expect(flagEmoji('')).toBe('');
        expect(flagEmoji('F')).toBe('');
        expect(flagEmoji('FRA')).toBe('');
        expect(flagEmoji('12')).toBe('');
    });
});

describe('slugify', () => {
    it('maps the 4 seed countries to their expected slugs', () => {
        expect(slugify('France')).toBe('france');
        expect(slugify('États-Unis')).toBe('etats-unis');
        expect(slugify('Japon')).toBe('japon');
        expect(slugify('Suisse')).toBe('suisse');
    });

    it('strips diacritics', () => {
        expect(slugify('Éléphant')).toBe('elephant');
        expect(slugify('Côte d\'Ivoire')).toBe('cote-d-ivoire');
    });

    it('converts spaces and underscores to hyphens', () => {
        expect(slugify('United States')).toBe('united-states');
        expect(slugify('New_Zealand')).toBe('new-zealand');
    });

    it('removes non-alphanumeric-hyphen characters', () => {
        expect(slugify('Royaume-Uni')).toBe('royaume-uni');
        expect(slugify("Côte d'Ivoire")).toBe('cote-d-ivoire');
    });

    it('collapses consecutive hyphens', () => {
        expect(slugify('A  B')).toBe('a-b');
    });
});

describe('resolveCountry', () => {
    it('resolves by slug', () => {
        expect(resolveCountry('france')?.code).toBe('FR');
        expect(resolveCountry('etats-unis')?.code).toBe('US');
        expect(resolveCountry('japon')?.code).toBe('JP');
        expect(resolveCountry('suisse')?.code).toBe('CH');
    });

    it('resolves by ISO2 code (upper)', () => {
        expect(resolveCountry('FR')?.slug).toBe('france');
        expect(resolveCountry('US')?.slug).toBe('etats-unis');
    });

    it('resolves by ISO2 code (lower)', () => {
        expect(resolveCountry('fr')?.slug).toBe('france');
        expect(resolveCountry('ch')?.slug).toBe('suisse');
    });

    it('is case-insensitive for slugs', () => {
        expect(resolveCountry('FRANCE')?.code).toBe('FR');
        expect(resolveCountry('France')?.code).toBe('FR');
    });

    it('resolves by French name', () => {
        expect(resolveCountry('États-Unis')?.code).toBe('US');
        expect(resolveCountry('suisse')?.code).toBe('CH');
    });

    it('resolves by English API name', () => {
        expect(resolveCountry('France')?.code).toBe('FR');
        expect(resolveCountry('United States')?.code).toBe('US');
        expect(resolveCountry('Japan')?.code).toBe('JP');
        expect(resolveCountry('Switzerland')?.code).toBe('CH');
    });

    it('returns undefined for unknown input', () => {
        expect(resolveCountry('unknown-country')).toBeUndefined();
        expect(resolveCountry('XY')).toBeUndefined();
    });

    it('returns undefined for null/undefined', () => {
        expect(resolveCountry(null)).toBeUndefined();
        expect(resolveCountry(undefined)).toBeUndefined();
        expect(resolveCountry('')).toBeUndefined();
    });
});

describe('codeFromSlug', () => {
    it('returns ISO2 code for known slugs', () => {
        expect(codeFromSlug('france')).toBe('FR');
        expect(codeFromSlug('suisse')).toBe('CH');
    });

    it('returns undefined for unknown slug', () => {
        expect(codeFromSlug('royaume-uni')).toBeUndefined();
    });
});

describe('slugFromCode', () => {
    it('returns slug for known ISO2 code', () => {
        expect(slugFromCode('JP')).toBe('japon');
        expect(slugFromCode('us')).toBe('etats-unis');
    });

    it('returns undefined for unknown code', () => {
        expect(slugFromCode('GB')).toBeUndefined();
    });
});

describe('nameFromCode', () => {
    it('returns apiCountryName for known code', () => {
        expect(nameFromCode('FR')).toBe('France');
        expect(nameFromCode('US')).toBe('United States');
        expect(nameFromCode('JP')).toBe('Japan');
        expect(nameFromCode('CH')).toBe('Switzerland');
    });

    it('returns undefined for unknown code', () => {
        expect(nameFromCode('DE')).toBeUndefined();
    });
});

describe('codeFromName', () => {
    it('returns code from French name', () => {
        expect(codeFromName('France')).toBe('FR');
        expect(codeFromName('Japon')).toBe('JP');
    });

    it('returns code from English API name', () => {
        expect(codeFromName('United States')).toBe('US');
        expect(codeFromName('Switzerland')).toBe('CH');
    });

    it('returns undefined for unknown name', () => {
        expect(codeFromName('Deutschland')).toBeUndefined();
    });
});

describe('adzunaCodeFromSlug', () => {
    it('returns adzuna code for supported countries (except JP)', () => {
        expect(adzunaCodeFromSlug('france')).toBe('fr');
        expect(adzunaCodeFromSlug('etats-unis')).toBe('us');
        expect(adzunaCodeFromSlug('suisse')).toBe('ch');
    });

    it('returns undefined for japon (not supported by Adzuna)', () => {
        expect(adzunaCodeFromSlug('japon')).toBeUndefined();
    });

    it('returns correct code for non-SUPPORTED_COUNTRIES slugs', () => {
        expect(adzunaCodeFromSlug('royaume-uni')).toBe('gb');
        expect(adzunaCodeFromSlug('canada')).toBe('ca');
        expect(adzunaCodeFromSlug('allemagne')).toBe('de');
        expect(adzunaCodeFromSlug('australie')).toBe('au');
        expect(adzunaCodeFromSlug('singapour')).toBe('sg');
    });

    it('returns undefined for null/unknown', () => {
        expect(adzunaCodeFromSlug(null)).toBeUndefined();
        expect(adzunaCodeFromSlug('pays-imaginaires')).toBeUndefined();
    });
});

describe('SLUG_TO_ADZUNA_CODE', () => {
    it('contains all original SLUG_TO_ADZUNA entries', () => {
        // Verify that all 15 original entries are covered
        const original: Record<string, string> = {
            france: 'fr',
            'royaume-uni': 'gb',
            suisse: 'ch',
            'etats-unis': 'us',
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
        for (const [slug, code] of Object.entries(original)) {
            expect(SLUG_TO_ADZUNA_CODE[slug]).toBe(code);
        }
    });
});

describe('hydrateCountries / getRegistry', () => {
    const originalRegistry = getRegistry();

    afterEach(() => {
        hydrateCountries([...originalRegistry]);
    });

    it('getRegistry returns the seeded registry by default', () => {
        expect(getRegistry().length).toBeGreaterThan(0);
        expect(resolveCountry('fr')).toBeDefined();
    });

    it('hydrateCountries replaces the registry, affecting subsequent lookups', () => {
        hydrateCountries([
            {
                code: 'zz',
                slug: 'zedland',
                name: 'Zedland',
                apiCountryName: 'Zedland',
            } as any,
        ]);

        expect(getRegistry()).toHaveLength(1);
        expect(resolveCountry('zedland')?.code).toBe('zz');
        // The old seed data is gone until restored.
        expect(resolveCountry('fr')).toBeUndefined();
    });
});
