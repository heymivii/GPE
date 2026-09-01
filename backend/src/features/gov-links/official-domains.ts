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
