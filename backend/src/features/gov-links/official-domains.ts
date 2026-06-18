// Official / authoritative domains per supported country (suffix match on hostname).
const OFFICIAL_SUFFIXES: Record<string, string[]> = {
  FR: ['gouv.fr', 'service-public.fr', 'ameli.fr', 'campusfrance.org'],
  US: ['.gov', 'uscis.gov', 'state.gov'],
  JP: ['go.jp', 'moj.go.jp', 'isa.go.jp'],
  CH: ['admin.ch', 'ch.ch'],
};

export function officialSuffixes(countryCode: string): string[] {
  return OFFICIAL_SUFFIXES[countryCode.toUpperCase()] ?? [];
}

export function isOfficialDomain(url: string, countryCode: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  // Match exact host OR a proper subdomain only. The dot boundary is critical:
  // a bare `endsWith('gouv.fr')` would wrongly accept `evilgouv.fr`.
  return officialSuffixes(countryCode).some((sfx) => {
    const bare = sfx.replace(/^\./, '');
    return host === bare || host.endsWith(`.${bare}`);
  });
}
