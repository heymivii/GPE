import {
  SUPPORTED_COUNTRY_REGISTRY,
  SupportedCountry,
} from './supported-countries';

// Official / authoritative domains per supported country (suffix match on hostname).
// Derived from the single country registry — do not duplicate the list here.
export function officialSuffixes(countryCode: string): string[] {
  return (
    SUPPORTED_COUNTRY_REGISTRY[countryCode.toUpperCase() as SupportedCountry]
      ?.officialSuffixes ?? []
  );
}

export function isOfficialDomain(
  url: string,
  countryCode: string,
  suffixes?: string[],
): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  // Match exact host OR a proper subdomain only. The dot boundary is critical:
  // a bare `endsWith('gouv.fr')` would wrongly accept `evilgouv.fr`.
  return (suffixes ?? officialSuffixes(countryCode)).some((sfx) => {
    const bare = sfx.replace(/^\./, '');
    return host === bare || host.endsWith(`.${bare}`);
  });
}

/**
 * Priorité aux domaines de la fiche (carnet de recherche) : si au moins un
 * candidat vérifié vit sur l'un des domaines ciblés par la fiche, on restreint
 * le choix à ceux-là — la requête ouverte reste un filet de sécurité quand la
 * fiche est vide ou ses domaines injoignables, plus un concurrent à égalité.
 * (Cas vécu : fiche visa FR = france-visas.gouv.fr, mais le candidat mort au
 * verify laissait gagner japon.campusfrance.org via la requête ouverte.)
 */
export function preferHintDomains<T extends { url: string }>(
  candidates: T[],
  hintDomains: string[] | null | undefined,
): T[] {
  const domains = (hintDomains ?? []).map((d) => d.trim()).filter(Boolean);
  if (domains.length === 0) return candidates;
  const preferred = candidates.filter((c) => isOfficialDomain(c.url, '', domains));
  return preferred.length > 0 ? preferred : candidates;
}
