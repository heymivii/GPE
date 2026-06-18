/**
 * useSupportedCountries.ts
 *
 * Fetches active countries and cities from the backend and merges them with the
 * curated static seed (SUPPORTED_COUNTRIES) to build a dynamic SupportedCountry list.
 *
 * Merge strategy:
 *  - If the DB country's ISO2 code matches a SEED entry → use the SEED entry verbatim
 *    (preserves curated slug / i18nKey / apiCity / flag).
 *  - Otherwise → derive all fields from DB data (flagEmoji, slugify, ISO2_TO_ISO3 lookup).
 *
 * After a successful fetch, hydrateCountries() is called so all synchronous registry
 * consumers (resolveCountry, slugFromCode, etc.) reflect the DB list going forward.
 * While loading or on error the static seed is returned so the UI always has data.
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { countryApi } from '../api/country';
import { cityApi, type City } from '../api/city';
import {
    SUPPORTED_COUNTRIES,
    ISO2_TO_ISO3,
    CITIES_BY_COUNTRY,
    type SupportedCountry,
} from '../data/supportedCountries';
import { flagEmoji, slugify, hydrateCountries } from '../data/countryMappings';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CitiesByCountry = Record<string, string[]>;

export interface UseSupportedCountriesResult {
    countries: SupportedCountry[];
    citiesByCountry: CitiesByCountry;
    isLoading: boolean;
    error: Error | null;
}

// ─── Seed index for fast lookup ────────────────────────────────────────────────

const SEED_BY_CODE = new Map<string, SupportedCountry>(
    SUPPORTED_COUNTRIES.map(c => [c.code.toUpperCase(), c]),
);

// ─── Merge helpers ─────────────────────────────────────────────────────────────

/**
 * Given a list of active cities, return the best representative city name for a country:
 * prefer the capital, then the first city, then fallback to the provided default.
 */
function pickApiCity(cities: City[], fallback: string): string {
    const capital = cities.find(c => c.isCapital);
    if (capital) return capital.name;
    if (cities.length > 0) return cities[0].name;
    return fallback;
}

/**
 * Build a SupportedCountry from a DB country record, using the seed entry when
 * the ISO2 code matches (authoritative for known countries).
 */
function buildSupportedCountry(
    dbCountry: { isoCode?: string; countryName: string },
    citiesForCountry: City[],
): SupportedCountry | null {
    const code = dbCountry.isoCode?.toUpperCase();
    if (!code) return null; // skip countries without an ISO2 code

    // Prefer the curated seed entry for known countries.
    const seed = SEED_BY_CODE.get(code);
    if (seed) return seed;

    // Derive all fields for a new country.
    const name = dbCountry.countryName;
    const slug = slugify(name);
    const iso3 = ISO2_TO_ISO3[code] ?? code;
    const apiCity = pickApiCity(citiesForCountry, name);

    return {
        code,
        name,
        slug,
        flag: flagEmoji(code),
        iso3,
        i18nKey: `countries.${slug}`,
        apiCity,
        apiCountryName: name,
    };
}

/**
 * Build a citiesByCountry map (keyed by French display name, matching CITIES_BY_COUNTRY)
 * from the flat list of active DB cities.
 */
function buildCitiesByCountry(
    countries: SupportedCountry[],
    activeCities: City[],
): CitiesByCountry {
    // Build a quick lookup: countryId → SupportedCountry
    // We don't have a direct countryId → SupportedCountry mapping from the DB response
    // alone, so we use the country relation name to find the matching SupportedCountry.
    const byApiName = new Map<string, SupportedCountry>(
        countries.map(c => [c.apiCountryName.toLowerCase(), c]),
    );

    const result: CitiesByCountry = {};
    for (const city of activeCities) {
        const countryName = city.country?.countryName;
        if (!countryName) continue;
        const sc = byApiName.get(countryName.toLowerCase());
        const displayKey = sc?.name ?? countryName; // use French name as key (matches legacy)
        if (!result[displayKey]) result[displayKey] = [];
        result[displayKey].push(city.name);
    }

    // Fall back to the static CITIES_BY_COUNTRY entries for any seed country that has
    // no active cities in the DB yet (preserves existing behaviour).
    for (const c of countries) {
        if (!result[c.name] && CITIES_BY_COUNTRY[c.name]) {
            result[c.name] = CITIES_BY_COUNTRY[c.name];
        }
    }

    return result;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useSupportedCountries(): UseSupportedCountriesResult {
    const countriesQuery = useQuery({
        queryKey: ['countries', 'active'],
        queryFn: countryApi.getActive,
        staleTime: 30 * 60 * 1000, // 30 min
        retry: 2,
    });

    const citiesQuery = useQuery({
        queryKey: ['cities', 'active'],
        queryFn: cityApi.getActive,
        staleTime: 30 * 60 * 1000, // 30 min
        retry: 2,
    });

    const isLoading = countriesQuery.isLoading || citiesQuery.isLoading;
    const error = (countriesQuery.error ?? citiesQuery.error) as Error | null;

    const dbCountries = countriesQuery.data ?? [];
    const dbCities    = citiesQuery.data   ?? [];

    // Build merged list when both queries have resolved.
    const countries: SupportedCountry[] = (() => {
        if (!countriesQuery.data) return SUPPORTED_COUNTRIES;

        // Group active cities by countryId for fast lookup.
        const citiesByCountryId = new Map<number, City[]>();
        for (const city of dbCities) {
            const arr = citiesByCountryId.get(city.countryId) ?? [];
            arr.push(city);
            citiesByCountryId.set(city.countryId, arr);
        }

        const merged: SupportedCountry[] = [];
        for (const dbCountry of dbCountries) {
            const cities = citiesByCountryId.get(dbCountry.idCountry) ?? [];
            const sc = buildSupportedCountry(
                { isoCode: dbCountry.isoCode, countryName: dbCountry.countryName },
                cities,
            );
            if (sc) merged.push(sc);
        }

        // If the merge yielded nothing (e.g. DB has no active countries yet), fall back.
        return merged.length > 0 ? merged : SUPPORTED_COUNTRIES;
    })();

    const citiesByCountry: CitiesByCountry = (() => {
        if (!countriesQuery.data) return CITIES_BY_COUNTRY;
        return buildCitiesByCountry(countries, dbCities);
    })();

    // Hydrate the synchronous registry once the merged list is ready.
    useEffect(() => {
        if (!isLoading && !error && countriesQuery.data) {
            hydrateCountries(countries);
        }
    }, [countries, isLoading, error, countriesQuery.data]);

    return { countries, citiesByCountry, isLoading, error };
}
