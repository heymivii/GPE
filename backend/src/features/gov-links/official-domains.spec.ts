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
});
