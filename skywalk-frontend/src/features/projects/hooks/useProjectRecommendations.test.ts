import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProjectRecommendations } from './useProjectRecommendations';
import type { ExpatriationProject } from '../../../types/expatriation-project';
import type { Country } from '../../../types/country';

const baseProject = {
  idProject: 10,
  idUser: 3,
  idDestinationCountry: 1,
  mainObjective: 'work',
  expectedDuration: 24,
  travelType: 'alone',
  needsSupport: false,
  projectStatus: 'planning',
  createdAt: '',
  updatedAt: '',
} as ExpatriationProject;

const france = { idCountry: 1, name: 'France', isoCode: 'FR' } as unknown as Country;

describe('useProjectRecommendations — libre circulation', () => {
  it('suisse → France : AUCUNE recommandation de visa, ni étape, ni service (cas du projet #10)', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, nationality: 'CH' }, france),
    );
    expect(result.current.freeMovement).toBe(true);
    expect(result.current.visa).toBeNull();
    expect(result.current.alternativeVisa).toBeNull();
    expect(result.current.actionPlan.some((s) => s.id === 'visa-step')).toBe(false);
    expect(result.current.services.some((s) => s.id === 'visa')).toBe(false);
  });

  it('américain → France : la recommandation de visa reste entière', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, nationality: 'US' }, france),
    );
    expect(result.current.freeMovement).toBe(false);
    expect(result.current.visa).not.toBeNull();
    expect(result.current.actionPlan.some((s) => s.id === 'visa-step')).toBe(true);
    expect(result.current.services.some((s) => s.id === 'visa')).toBe(true);
  });

  it('nationalité inconnue : prudence — pas de libre circulation supposée', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, nationality: undefined }, france),
    );
    expect(result.current.freeMovement).toBe(false);
    expect(result.current.visa).not.toBeNull();
  });
});
