/**
 * Nationality + free-movement logic — the visa determinant.
 * A citizen of an EU/EEA/CH state has free movement into the EU and Switzerland, so the
 * visa / long-stay-residence steps don't apply to them for those destinations.
 */

// EU-27 + EEA (Iceland, Liechtenstein, Norway) + Switzerland → mutual free movement.
export const EU_EEA_CH = new Set<string>([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'SE', 'IS', 'LI', 'NO', 'CH',
]);

/** ISO2 → French label, for the onboarding nationality picker (EU/EEA/CH + common + fallback). */
export const NATIONALITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'CH', label: 'Suisse' },
  { value: 'DE', label: 'Allemagne' },
  { value: 'ES', label: 'Espagne' },
  { value: 'IT', label: 'Italie' },
  { value: 'PT', label: 'Portugal' },
  { value: 'NL', label: 'Pays-Bas' },
  { value: 'IE', label: 'Irlande' },
  { value: 'PL', label: 'Pologne' },
  { value: 'RO', label: 'Roumanie' },
  { value: 'SE', label: 'Suède' },
  { value: 'NO', label: 'Norvège' },
  // Non-EU/EEA (need a visa for FR/CH long stays)
  { value: 'GB', label: 'Royaume-Uni' },
  { value: 'US', label: 'États-Unis' },
  { value: 'CA', label: 'Canada' },
  { value: 'MA', label: 'Maroc' },
  { value: 'DZ', label: 'Algérie' },
  { value: 'TN', label: 'Tunisie' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'CM', label: 'Cameroun' },
  { value: 'JP', label: 'Japon' },
  { value: 'CN', label: 'Chine' },
  { value: 'IN', label: 'Inde' },
  { value: 'BR', label: 'Brésil' },
  { value: 'OTHER', label: 'Autre (hors UE/EEE)' },
];

/**
 * True when a citizen of `nationality` needs NO visa / residence permit to settle in
 * `destination` (EU/EEA/CH citizen → EU or CH destination). Unknown/OTHER → not exempt.
 */
export function isVisaExempt(
  nationality: string | null | undefined,
  destination: string | null | undefined,
): boolean {
  if (!nationality || !destination) return false;
  const nat = nationality.toUpperCase();
  const dest = destination.toUpperCase();
  const destIsEuOrCh = EU_EEA_CH.has(dest);
  return destIsEuOrCh && EU_EEA_CH.has(nat);
}
