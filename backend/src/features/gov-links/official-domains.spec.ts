import { isOfficialDomain } from './official-domains';

describe('isOfficialDomain', () => {
  it('accepts an official FR domain', () => {
    expect(isOfficialDomain('https://france-visas.gouv.fr/en/etudiant', 'FR')).toBe(true);
    expect(isOfficialDomain('https://www.service-public.fr/x', 'FR')).toBe(true);
  });
  it('rejects a non-official domain', () => {
    expect(isOfficialDomain('https://blog-immigration.com/visa', 'FR')).toBe(false);
  });
  it('accepts a US .gov and rejects .com', () => {
    expect(isOfficialDomain('https://travel.state.gov/visa', 'US')).toBe(true);
    expect(isOfficialDomain('https://visa-help.com', 'US')).toBe(false);
  });
  it('returns false on a malformed url', () => {
    expect(isOfficialDomain('not a url', 'FR')).toBe(false);
  });

  // Allowlist-bypass guard: a look-alike suffix WITHOUT the dot boundary must be rejected.
  it('rejects look-alike domains that only share the suffix (no dot boundary)', () => {
    expect(isOfficialDomain('https://evilgouv.fr/visa', 'FR')).toBe(false);
    expect(isOfficialDomain('https://notservice-public.fr', 'FR')).toBe(false);
    expect(isOfficialDomain('https://fakego.jp', 'JP')).toBe(false);
    expect(isOfficialDomain('https://notadmin.ch', 'CH')).toBe(false);
    expect(isOfficialDomain('https://mygov.com', 'US')).toBe(false);
  });

  it('still accepts the bare official host itself and real subdomains', () => {
    expect(isOfficialDomain('https://gouv.fr', 'FR')).toBe(true);
    expect(isOfficialDomain('https://www.moj.go.jp/abc', 'JP')).toBe(true);
    expect(isOfficialDomain('https://sem.admin.ch', 'CH')).toBe(true);
  });
});
