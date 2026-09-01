import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../data/freeMovement', () => ({
  isVisaExempt: (nat?: string | null, dest?: string | null) =>
    nat === 'FR' && dest === 'DE',
}));

import { personalizeFilter, sortByPriorities } from './personalize';

const steps = [
  { category: 'visa', id: 1 },
  { category: 'education', id: 2 },
  { category: 'logement', id: 3 },
  { category: 'emploi', id: 4 },
];

describe('personalizeFilter', () => {
  it('hides the visa category for a visa-exempt profile (free movement)', () => {
    const result = personalizeFilter(steps, { nationality: 'FR', destinationIso: 'DE' });
    expect(result.map((s) => s.category)).not.toContain('visa');
  });

  it('hides the education category when the user has no children', () => {
    const result = personalizeFilter(steps, { hasChildren: false });
    expect(result.map((s) => s.category)).not.toContain('education');
  });

  it('hides nothing when hasChildren is true or unknown', () => {
    expect(personalizeFilter(steps, { hasChildren: true })).toEqual(steps);
    expect(personalizeFilter(steps, {})).toEqual(steps);
  });

  it('applies both rules together and preserves the original order', () => {
    const result = personalizeFilter(steps, {
      nationality: 'FR',
      destinationIso: 'DE',
      hasChildren: false,
    });
    expect(result.map((s) => s.category)).toEqual(['logement', 'emploi']);
  });

  it('returns the same array reference when nothing is hidden', () => {
    const result = personalizeFilter(steps, {});
    expect(result).toBe(steps);
  });
});

describe('sortByPriorities', () => {
  it('floats matching priority categories to the top, keeping relative order (stable sort)', () => {
    const result = sortByPriorities(steps, 'housing,employment');
    expect(result.map((s) => s.category)).toEqual(['logement', 'emploi', 'visa', 'education']);
  });

  it('ignores unknown priority ids', () => {
    const result = sortByPriorities(steps, 'unknown_priority');
    expect(result).toEqual(steps);
  });

  it('returns the input unchanged when priorities is empty or null', () => {
    expect(sortByPriorities(steps, '')).toEqual(steps);
    expect(sortByPriorities(steps, null)).toEqual(steps);
    expect(sortByPriorities(steps, undefined)).toEqual(steps);
  });

  it('trims whitespace around each priority id', () => {
    const result = sortByPriorities(steps, ' housing , employment ');
    expect(result.map((s) => s.category)).toEqual(['logement', 'emploi', 'visa', 'education']);
  });
});
