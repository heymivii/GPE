export interface SearchCandidate {
  url: string;
  title: string;
  snippet: string;
}

export interface RankResult {
  index: number; // index INTO the candidates array (never a free URL)
  label: string;
  confidence: number; // 0..1
}

// 'pending_review' = machine-verified, awaiting HUMAN approval (only 'active' is published).
export type GovLinkStatus =
  | 'pending_review'
  | 'active'
  | 'needs_review'
  | 'dead';

// Canonical service categories (aligned with services-config.ts).
export const CANONICAL_CATEGORIES = [
  'emploi',
  'logement',
  'transport',
  'sante',
  'demarches',
  'education',
  'culture',
  'business',
  'visa',
  'banque',
  'demarches-admin',
] as const;
export type Category = (typeof CANONICAL_CATEGORIES)[number];

// Re-exported from the single country registry (supported-countries.ts).
export { SUPPORTED_COUNTRIES } from './supported-countries';
export type { SupportedCountry } from './supported-countries';
