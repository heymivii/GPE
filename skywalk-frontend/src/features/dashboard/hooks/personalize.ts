import { isVisaExempt } from '../../../data/freeMovement';

/**
 * Turns the collected profile into a REALLY personalised checklist — the point of asking those
 * questions. High-confidence rules only (never hide a step we're unsure about):
 *   - EU/EEA/CH citizen → EU/CH destination: no visa step, and no residence-permit
 *     step either (free movement) — EXCEPT a CH destination, where EU/EEA citizens
 *     still must register with their commune and obtain a B/L permit;
 *   - no children: hide school/childcare (`education`);
 *   - priorities: matching categories float to the top.
 * status / stayDuration / travelType are intentionally NOT used to hide steps (no safe rule).
 */
export interface PersonalizationContext {
  nationality?: string | null;
  destinationIso?: string | null;
  hasChildren?: boolean | null;
  /** Project.priorities, a comma-separated string of priority ids. */
  priorities?: string | null;
}

// Priority id (onboarding) → checklist category.
const PRIORITY_TO_CATEGORY: Record<string, string> = {
  housing: 'logement',
  employment: 'emploi',
  transport: 'transport',
  admin_help: 'demarches',
  health: 'sante',
  social_integration: 'culture',
};

/** Categories hidden for this profile (high-confidence only). */
function hiddenCategories(ctx: PersonalizationContext): Set<string> {
  const hidden = new Set<string>();
  if (isVisaExempt(ctx.nationality, ctx.destinationIso)) {
    hidden.add('visa');
    // Libre circulation : pas de titre de séjour non plus — les données officielles le
    // confirment (« ils n'ont pas l'obligation de détenir un titre de séjour »).
    // EXCEPTION Suisse : un citoyen UE/EEE qui s'y installe doit s'annoncer à sa
    // commune et obtenir un permis (B/L) — l'étape reste donc affichée pour CH.
    if (ctx.destinationIso?.toUpperCase() !== 'CH') {
      hidden.add('demarches');
    }
  }
  if (ctx.hasChildren === false) {
    hidden.add('education');
  }
  return hidden;
}

/** Drop steps irrelevant to this profile. Pure; preserves input order. */
export function personalizeFilter<T extends { category: string }>(
  steps: T[],
  ctx: PersonalizationContext,
): T[] {
  const hidden = hiddenCategories(ctx);
  if (hidden.size === 0) return steps;
  return steps.filter((s) => !hidden.has(s.category));
}

/** Stable sort putting the user's priority categories first (ties keep original order). */
export function sortByPriorities<T extends { category: string }>(
  steps: T[],
  priorities?: string | null,
): T[] {
  const wanted = new Set(
    (priorities ?? '')
      .split(',')
      .map((p) => PRIORITY_TO_CATEGORY[p.trim()])
      .filter(Boolean),
  );
  if (wanted.size === 0) return steps;
  return steps
    .map((s, i) => ({ s, i, prio: wanted.has(s.category) ? 0 : 1 }))
    .sort((a, b) => a.prio - b.prio || a.i - b.i)
    .map((x) => x.s);
}
