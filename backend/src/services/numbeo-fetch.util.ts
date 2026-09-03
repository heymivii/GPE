import axios from 'axios';

/**
 * Fetch Numbeo partagé par les trois scrapers (coût de la vie, qualité de vie,
 * immobilier). Deux réalités que le fetch nu masquait :
 *
 *  1. Numbeo (Cloudflare) refuse souvent les IP de datacenter (Heroku) en 503/403 —
 *     le slug n'y est pour rien. On retente (le blocage est parfois intermittent)
 *     puis on lève une erreur TYPÉE pour que l'admin reçoive le vrai diagnostic
 *     au lieu de « Check the Numbeo slug ».
 *  2. Un slug inconnu ne fait PAS un 404 : Numbeo répond 200 avec une page
 *     « Cannot find city id ». Sans détection, le parseur avale la page d'erreur.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const RETRYABLE_STATUSES = new Set([429, 503]);
const BLOCKED_STATUSES = new Set([403, 429, 503]);
const RETRY_DELAYS_MS = [2000, 5000];

/** Numbeo (anti-bot) a refusé la requête — problème d'IP serveur, pas de slug. */
export class NumbeoBlockedError extends Error {
  constructor(public readonly status: number) {
    super(
      `Numbeo a refusé la requête depuis ce serveur (HTTP ${status}, anti-bot). ` +
        `Le slug est probablement correct — utilisez le pipeline local : ` +
        `npm run col:refresh -- <slug> puis npm run seed:cost-of-living:curated.`,
    );
    this.name = 'NumbeoBlockedError';
  }
}

/** Numbeo ne connaît pas ce slug (page « Cannot find city id »). */
export class NumbeoUnknownSlugError extends Error {
  constructor(url: string) {
    super(
      `Numbeo ne connaît pas cette page (« Cannot find city id »). ` +
        `Vérifiez le slug dans l'URL : ${url}`,
    );
    this.name = 'NumbeoUnknownSlugError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchNumbeoPage(
  url: string,
  timeout = 25000,
): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      const { data } = await axios.get<string>(url, {
        timeout,
        headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
      });
      if (/<title>\s*Cannot find (?:city|country) id/i.test(data)) {
        throw new NumbeoUnknownSlugError(url);
      }
      return data;
    } catch (e) {
      if (e instanceof NumbeoUnknownSlugError) throw e;
      const status = axios.isAxiosError(e) ? e.response?.status : undefined;
      if (
        status !== undefined &&
        RETRYABLE_STATUSES.has(status) &&
        attempt < RETRY_DELAYS_MS.length
      ) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      if (status !== undefined && BLOCKED_STATUSES.has(status)) {
        throw new NumbeoBlockedError(status);
      }
      throw e;
    }
  }
}
