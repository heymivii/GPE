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

export interface NationalityOption {
  value: string;
  /** Gentilé français en minuscules : « Je suis… français·e ». */
  label: string;
  /** Adjectif anglais : « I am… French », « As a French citizen ». */
  labelEn: string;
}

/**
 * Nationalités du sélecteur « Je suis… ».
 *
 * Ces libellés portaient des noms de PAYS (« Je suis… France »), ce qui n'est pas
 * du français : le champ demande une nationalité, donc un gentilé. La même valeur
 * alimente aussi la phrase de verdict (« Ressortissant·e français·e, vous… »),
 * qui était tout aussi bancale.
 */
export const NATIONALITY_OPTIONS: NationalityOption[] = [
  { value: 'FR', label: 'français·e', labelEn: 'French' },
  { value: 'BE', label: 'belge', labelEn: 'Belgian' },
  { value: 'CH', label: 'suisse', labelEn: 'Swiss' },
  { value: 'DE', label: 'allemand·e', labelEn: 'German' },
  { value: 'ES', label: 'espagnol·e', labelEn: 'Spanish' },
  { value: 'IT', label: 'italien·ne', labelEn: 'Italian' },
  { value: 'PT', label: 'portugais·e', labelEn: 'Portuguese' },
  { value: 'NL', label: 'néerlandais·e', labelEn: 'Dutch' },
  { value: 'IE', label: 'irlandais·e', labelEn: 'Irish' },
  { value: 'PL', label: 'polonais·e', labelEn: 'Polish' },
  { value: 'RO', label: 'roumain·e', labelEn: 'Romanian' },
  { value: 'SE', label: 'suédois·e', labelEn: 'Swedish' },
  { value: 'NO', label: 'norvégien·ne', labelEn: 'Norwegian' },
  // Hors UE/EEE : un visa est requis pour un long séjour en France ou en Suisse.
  { value: 'GB', label: 'britannique', labelEn: 'British' },
  { value: 'US', label: 'américain·e', labelEn: 'American' },
  { value: 'CA', label: 'canadien·ne', labelEn: 'Canadian' },
  { value: 'MA', label: 'marocain·e', labelEn: 'Moroccan' },
  { value: 'DZ', label: 'algérien·ne', labelEn: 'Algerian' },
  { value: 'TN', label: 'tunisien·ne', labelEn: 'Tunisian' },
  { value: 'SN', label: 'sénégalais·e', labelEn: 'Senegalese' },
  { value: 'CI', label: 'ivoirien·ne', labelEn: 'Ivorian' },
  { value: 'CM', label: 'camerounais·e', labelEn: 'Cameroonian' },
  { value: 'JP', label: 'japonais·e', labelEn: 'Japanese' },
  { value: 'CN', label: 'chinois·e', labelEn: 'Chinese' },
  { value: 'IN', label: 'indien·ne', labelEn: 'Indian' },
  { value: 'BR', label: 'brésilien·ne', labelEn: 'Brazilian' },
  { value: 'OTHER', label: "d'un autre pays (hors UE/EEE)", labelEn: 'from another country (outside the EU/EEA)' },
];

/** Libellé de nationalité dans la langue courante de l'interface. */
export function nationalityLabel(
  value: string | null | undefined,
  lang: string | undefined,
): string {
  if (!value) return '';
  const option = NATIONALITY_OPTIONS.find((n) => n.value === value);
  if (!option) return value;
  return lang?.startsWith('en') ? option.labelEn : option.label;
}

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
