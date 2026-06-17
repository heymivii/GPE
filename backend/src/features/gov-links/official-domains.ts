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
  return officialSuffixes(countryCode).some(
    (sfx) => host === sfx || host.endsWith(sfx.startsWith('.') ? sfx : `.${sfx}`) || host.endsWith(sfx),
  );
}
