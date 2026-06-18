export interface SearchCandidate {
  url: string;
  title: string;
  snippet: string;
}

export interface RankResult {
  index: number;      // index INTO the candidates array (never a free URL)
  label: string;
  confidence: number; // 0..1
}

export type GovLinkStatus = 'active' | 'needs_review' | 'dead';

// Canonical service categories (aligned with services-config.ts).
export const CANONICAL_CATEGORIES = [
  'emploi', 'logement', 'transport', 'sante', 'demarches',
  'education', 'culture', 'business', 'visa', 'banque', 'demarches-admin',
] as const;
export type Category = (typeof CANONICAL_CATEGORIES)[number];

export const SUPPORTED_COUNTRIES = ['FR', 'US', 'JP', 'CH'] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];
