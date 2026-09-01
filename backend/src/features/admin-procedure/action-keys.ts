/**
 * Controlled vocabulary of checklist ACTION KEYS — namespaced (base per category + country extensions).
 *
 * Why: checklist completion must survive REGENERATION. The LLM that extracts actions is
 * non-deterministic, so positional indices corrupt progress. At generation, each extracted
 * action is CLASSIFIED (in `generateFromGovLinks`) into one of the keys ALLOWED for the current
 * (country, category) = base(category) ∪ extensions(country, category). Completion is then keyed
 * by these STABLE action keys (stored in `procedure_tracking.completed_facts`).
 *
 * Vocabulary shape:
 *  - BASE keys are BARE (e.g. 'gather_docs'); a tracking row is already scoped to one category,
 *    so a bare key is unambiguous. A small UNIVERSAL SPINE (gather_docs, book_appointment,
 *    submit, pay_fee, register, recognize_diploma) is reused across categories for consistency.
 *  - COUNTRY EXTENSION keys are FULLY namespaced `<country>.<category>.<key>`
 *    (e.g. 'fr.demarches.validate_vls_ts') — country-specific steps.
 *  - Any action the LLM can't classify → `other:<contentHash>` (kept, never invented).
 *
 * 3-6 keys per category. `action_items` becomes `{ key, label }` (label = displayed text).
 */

export interface ActionKeyDef {
  key: string;
  label: string; // default French label (fallback / display for `stale` items)
}

export const OTHER_KEY = 'other';

/** Universal spine — same key string reused across categories (consistent semantics). */
// (documentation only; the strings below are what's authoritative)
//   gather_docs · book_appointment · submit · pay_fee · register · recognize_diploma

/** BASE keys per category (bare keys). 3-6 each. */
export const BASE_ACTION_KEYS: Record<string, ActionKeyDef[]> = {
  visa: [
    { key: 'determine_need', label: 'Vérifier si un visa est nécessaire' },
    { key: 'gather_docs', label: 'Rassembler les documents requis' },
    { key: 'complete_form', label: 'Remplir le formulaire de demande' },
    { key: 'submit', label: 'Déposer la demande de visa' },
  ],
  demarches: [
    // titre de séjour / résidence
    { key: 'prepare_request', label: 'Préparer la demande de titre de séjour' },
    { key: 'gather_docs', label: 'Rassembler les justificatifs' },
    { key: 'book_appointment', label: 'Prendre rendez-vous (autorité compétente)' },
    { key: 'submit', label: 'Déposer la demande' },
  ],
  'demarches-admin': [
    { key: 'gather_docs', label: 'Rassembler les documents administratifs' },
    { key: 'translate_docs', label: 'Faire traduire / légaliser les documents' },
    { key: 'register', label: 'S’enregistrer auprès des autorités locales' },
  ],
  sante: [
    { key: 'affiliate', label: 'S’affilier à l’assurance maladie' },
    { key: 'gather_docs', label: 'Réunir les pièces (identité, séjour, RIB)' },
    { key: 'get_card', label: 'Obtenir la carte / attestation de droits' },
    { key: 'declare_doctor', label: 'Déclarer un médecin traitant' },
  ],
  logement: [
    { key: 'search', label: 'Rechercher un logement' },
    { key: 'prepare_file', label: 'Constituer le dossier de location' },
    { key: 'sign_lease', label: 'Signer le bail' },
    { key: 'insurance', label: 'Souscrire une assurance habitation' },
    { key: 'aids', label: 'Vérifier les aides au logement' },
  ],
  emploi: [
    { key: 'work_permit', label: 'Vérifier le droit / permis de travail' },
    { key: 'gather_docs', label: 'Préparer les documents (CV, diplômes)' },
    { key: 'recognize_diploma', label: 'Faire reconnaître les diplômes' },
    { key: 'register', label: 'S’inscrire auprès de l’organisme emploi' },
  ],
  banque: [
    { key: 'choose_bank', label: 'Choisir une banque' },
    { key: 'gather_docs', label: 'Réunir les justificatifs (identité, domicile)' },
    { key: 'open_account', label: 'Ouvrir un compte bancaire' },
  ],
  transport: [
    { key: 'exchange_license', label: 'Échanger le permis de conduire étranger' },
    { key: 'public_pass', label: 'Souscrire un abonnement de transport' },
    { key: 'register_vehicle', label: 'Immatriculer un véhicule' },
  ],
  education: [
    { key: 'enroll', label: 'Inscrire (école / université)' },
    { key: 'gather_docs', label: 'Rassembler les documents scolaires' },
    { key: 'recognize_diploma', label: 'Faire reconnaître les diplômes' },
  ],
  culture: [
    { key: 'discover', label: 'Découvrir la vie culturelle locale' },
    { key: 'join_association', label: 'Rejoindre une association' },
    { key: 'learn_language', label: 'Se former à la langue locale' },
  ],
  business: [
    { key: 'choose_status', label: 'Choisir le statut (société / indépendant)' },
    { key: 'gather_docs', label: 'Préparer les documents' },
    { key: 'register', label: 'Immatriculer l’activité' },
  ],
};

/** COUNTRY EXTENSIONS, keyed by `${countryIso2Lower}.${category}`. Fully-namespaced keys. */
export const COUNTRY_ACTION_KEYS: Record<string, ActionKeyDef[]> = {
  'fr.demarches': [
    { key: 'fr.demarches.validate_vls_ts', label: 'Valider le VLS-TS en ligne (≤ 3 mois après l’arrivée)' },
  ],
  'fr.banque': [
    { key: 'fr.banque.right_to_account', label: 'Faire valoir le droit au compte (Banque de France)' },
  ],
  'fr.sante': [
    { key: 'fr.sante.puma', label: 'Demander l’affiliation à la PUMa (après 3 mois de résidence)' },
  ],
  'ch.sante': [
    { key: 'ch.sante.lamal', label: 'Souscrire l’assurance maladie LAMal (≤ 3 mois)' },
  ],
  'us.demarches': [
    { key: 'us.demarches.ssn', label: 'Demander un numéro de sécurité sociale (SSN)' },
  ],
  'jp.demarches': [
    { key: 'jp.demarches.residence_card', label: 'Obtenir la carte de résident (zairyū) + enregistrement en mairie' },
  ],
};

/** Allowed keys for (country, category) = base(category) ∪ extensions(country, category). */
export function allowedActionKeys(countryCode: string, category: string): ActionKeyDef[] {
  const base = BASE_ACTION_KEYS[category] ?? [];
  const ext = COUNTRY_ACTION_KEYS[`${countryCode.toLowerCase()}.${category}`] ?? [];
  return [...base, ...ext];
}

export function isAllowedKey(countryCode: string, category: string, key: string): boolean {
  return allowedActionKeys(countryCode, category).some((d) => d.key === key);
}

export function defaultLabel(countryCode: string, category: string, key: string): string | undefined {
  return allowedActionKeys(countryCode, category).find((d) => d.key === key)?.label;
}

/** Deterministic short content hash (djb2 → base36, 8 chars) for `other` disambiguation. */
export function hashContent(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 8);
}

export function otherKey(text: string): string {
  return `${OTHER_KEY}:${hashContent(text)}`;
}

/** Clamp an LLM-proposed key to the allowed set for (country, category); else `other:<hash>`. */
export function clampActionKey(
  countryCode: string,
  category: string,
  proposedKey: string | undefined,
  text: string,
): string {
  if (proposedKey && isAllowedKey(countryCode, category, proposedKey)) return proposedKey;
  return otherKey(text);
}
