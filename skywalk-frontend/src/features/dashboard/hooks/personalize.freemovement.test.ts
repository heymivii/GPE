import { describe, it, expect } from 'vitest';
import { personalizeFilter } from './personalize';

const steps = [
  { category: 'visa' },
  { category: 'demarches' },
  { category: 'sante' },
  { category: 'education' },
];
const categories = (r: Array<{ category: string }>) => r.map((s) => s.category);

describe('personalizeFilter — libre circulation', () => {
  it('suisse → France : masque visa ET titre de séjour (cas du projet #10)', () => {
    const r = personalizeFilter(steps, { nationality: 'CH', destinationIso: 'FR' });
    expect(categories(r)).toEqual(['sante', 'education']);
  });

  it('français → Suisse : masque le visa mais GARDE le titre de séjour (permis B/L, annonce à la commune)', () => {
    const r = personalizeFilter(steps, { nationality: 'FR', destinationIso: 'CH' });
    expect(categories(r)).toEqual(['demarches', 'sante', 'education']);
  });

  it('américain → France : ne masque rien (pas de libre circulation)', () => {
    const r = personalizeFilter(steps, { nationality: 'US', destinationIso: 'FR' });
    expect(categories(r)).toEqual(['visa', 'demarches', 'sante', 'education']);
  });

  it('sans enfants : masque education, sans toucher au reste', () => {
    const r = personalizeFilter(steps, { nationality: 'US', destinationIso: 'FR', hasChildren: false });
    expect(categories(r)).toEqual(['visa', 'demarches', 'sante']);
  });
});
