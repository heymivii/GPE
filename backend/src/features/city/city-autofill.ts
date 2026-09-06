import axios from 'axios';
import { NotFoundException } from '@nestjs/common';

export interface CityAutofillData {
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  timezone: string | null;
  isCapital: boolean;
  imageUrl: string | null;
  matchedName: string | null;
}

/**
 * Auto-fill a city's geo data from FREE keyless sources:
 *   - Open-Meteo geocoding → latitude, longitude, population, timezone, capital flag
 *     (feature_code 'PPLC' = country capital), matched against the country name;
 *   - Wikipedia (fr) page image → imageUrl.
 * Best-effort: any missing piece stays null; throws only when NOTHING matched.
 */
export async function fetchCityAutofill(
name: string,
countryName?: string,
): Promise<CityAutofillData> {
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  const { data } = await axios.get<{
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      population?: number;
      timezone?: string;
      country?: string;
      feature_code?: string;
    }>;
  }>('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name, count: 10, language: 'fr', format: 'json' },
    timeout: 10000,
  });

  const results = data.results ?? [];
  const match =
    (countryName &&
      results.find((r) => norm(r.country ?? '') === norm(countryName))) ||
    results[0];
  if (!match) {
    throw new NotFoundException(
      `Aucune donnée géographique trouvée pour « ${name} »`,
    );
  }

  // Image Wikipédia (accessoire — jamais bloquant).
  // On tente d'abord la Wikipédia francophone, puis l'anglophone : les villes
  // enregistrées sous leur nom anglais n'ont pas de page fr correspondante
  // (« Phoenix » y renvoie vers la page d'homonymie « Phénix », sans photo).
  // En dernier recours, une RECHERCHE « ville + pays » : les noms de villes qui
  // sont aussi des noms communs tombent sinon sur la mauvaise page (« Phoenix »
  // renvoie l'oiseau mythologique, pas la capitale de l'Arizona).
  const imageUrl =
    (await fetchWikipediaImage(match.name, 'fr')) ??
    (await fetchWikipediaImage(match.name, 'en')) ??
    (await searchWikipediaImage(match.name, countryName ?? match.country));

  return {
    latitude: match.latitude ?? null,
    longitude: match.longitude ?? null,
    population: match.population ?? null,
    timezone: match.timezone ?? null,
    isCapital: match.feature_code === 'PPLC',
    imageUrl,
    matchedName: match.name ?? null,
  };
}

/**
 * Vignette de la page Wikipédia d'une ville, ou null.
 *
 * Wikimedia exige un User-Agent identifiable avec un contact : avec un agent
 * générique la requête est limitée en débit et l'image revient vide, ce qui se
 * confond avec « cette ville n'a pas de photo ».
 */
async function fetchWikipediaImage(
  title: string,
  lang: 'fr' | 'en',
): Promise<string | null> {
  try {
    const { data } = await axios.get<{
      query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
    }>(`https://${lang}.wikipedia.org/w/api.php`, {
      params: {
        action: 'query',
        titles: title,
        prop: 'pageimages',
        format: 'json',
        pithumbsize: 1200,
        redirects: 1,
      },
      timeout: 8000,
      headers: {
        'User-Agent':
          'SkyWalk/1.0 (https://skywalk-chi.vercel.app; contact@skywalk.com)',
      },
    });
    const pages = data.query?.pages ?? {};
    return Object.values(pages)[0]?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

/**
 * Même chose, mais en passant par la recherche Wikipédia (« ville pays »)
 * plutôt que par un titre exact : seule façon de départager les homonymies.
 */
async function searchWikipediaImage(
  city: string,
  country?: string,
): Promise<string | null> {
  if (!country) return null;
  try {
    const { data } = await axios.get<{
      query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
    }>('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        generator: 'search',
        gsrsearch: `${city} ${country}`,
        gsrlimit: 1,
        prop: 'pageimages',
        format: 'json',
        pithumbsize: 1200,
      },
      timeout: 8000,
      headers: {
        'User-Agent':
          'SkyWalk/1.0 (https://skywalk-chi.vercel.app; contact@skywalk.com)',
      },
    });
    const pages = data.query?.pages ?? {};
    return Object.values(pages)[0]?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}
