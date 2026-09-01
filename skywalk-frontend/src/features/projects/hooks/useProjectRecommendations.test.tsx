import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../../../data/visa-data', () => ({
  getVisaDataForCountry: vi.fn(),
}));

import { getVisaDataForCountry } from '../../../data/visa-data';
import { useProjectRecommendations } from './useProjectRecommendations';

const mockedGetVisaData = vi.mocked(getVisaDataForCountry);

const visaTypes = [
  {
    id: 'work-visa',
    type: 'Work Visa',
    color: 'blue',
    description: 'work desc',
    duration: '1 year',
    cost: '$100',
    processing: '2 weeks',
    learnMoreUrl: 'https://x/work',
  },
  {
    id: 'student-f1',
    type: 'Student Visa',
    color: 'green',
    description: 'student desc',
    duration: '4 years',
    cost: '$50',
    processing: '4 weeks',
    learnMoreUrl: 'https://x/student',
  },
  {
    id: 'family-greencard',
    type: 'Family Visa',
    color: 'pink',
    description: 'family desc',
    duration: '2 years',
    cost: '$200',
    processing: '6 weeks',
    learnMoreUrl: 'https://x/family',
  },
  {
    id: 'short-stay-schengen',
    type: 'Short Stay',
    color: 'gray',
    description: 'short desc',
    duration: '90 days',
    cost: '$0',
    processing: '1 week',
    learnMoreUrl: 'https://x/short',
  },
];

const country = { isoCode: 'fr' } as any;

const baseProject = {
  mainObjective: 'work',
  expectedDuration: 24,
  travelType: 'alone',
  priorities: '',
  housingBudget: undefined,
} as any;

describe('useProjectRecommendations', () => {
  beforeEach(() => {
    mockedGetVisaData.mockReturnValue({ visaTypes } as any);
  });

  it('returns empty defaults when project or country is missing', () => {
    const { result } = renderHook(() => useProjectRecommendations(undefined, country));
    expect(result.current).toEqual({
      visa: null,
      alternativeVisa: null,
      services: [],
      actionPlan: [],
      countryCode: null,
      durationCategory: 'short',
    });
  });

  it('uppercases the country ISO code', () => {
    const { result } = renderHook(() => useProjectRecommendations(baseProject, country));
    expect(result.current.countryCode).toBe('FR');
  });

  describe('duration classification', () => {
    it.each([
      [undefined, 'short'],
      [6, 'short'],
      [7, 'medium'],
      [12, 'medium'],
      [13, 'long'],
      [36, 'long'],
      [37, 'permanent'],
    ])('expectedDuration=%s -> %s', (months, expected) => {
      const { result } = renderHook(() =>
        useProjectRecommendations({ ...baseProject, expectedDuration: months }, country),
      );
      expect(result.current.durationCategory).toBe(expected);
    });
  });

  it('matches the work visa for a long-duration work project with high confidence', () => {
    const { result } = renderHook(() => useProjectRecommendations(baseProject, country));
    expect(result.current.visa?.visaId).toBe('work-visa');
    expect(result.current.visa?.confidence).toBe('high');
    expect(result.current.visa?.reason).toBe('projectRecommendations.visaReason.workLong');
  });

  it('uses the short-duration work reason when the stay is under a year', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, expectedDuration: 3 }, country),
    );
    expect(result.current.visa?.reason).toBe('projectRecommendations.visaReason.workShort');
  });

  it('forces a short-stay visa for a short adventure trip regardless of the objective mapping', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations(
        { ...baseProject, mainObjective: 'adventure', expectedDuration: 2 },
        country,
      ),
    );
    expect(result.current.visa?.visaId).toBe('short-stay-schengen');
  });

  it('matches the student visa for a study objective', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, mainObjective: 'study' }, country),
    );
    expect(result.current.visa?.visaId).toBe('student-f1');
  });

  it('suggests the work visa as an alternative for a study objective', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, mainObjective: 'study' }, country),
    );
    expect(result.current.alternativeVisa?.visaId).toBe('work-visa');
    expect(result.current.alternativeVisa?.confidence).toBe('low');
  });

  it('uses the family reason for a family_reunion objective', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, mainObjective: 'family_reunion' }, country),
    );
    expect(result.current.visa?.reason).toBe('projectRecommendations.visaReason.family');
  });

  it('uses the retirement reason for a retirement objective', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations(
        { ...baseProject, mainObjective: 'retirement', expectedDuration: 3 },
        country,
      ),
    );
    expect(result.current.visa?.reason).toBe('projectRecommendations.visaReason.retirement');
  });

  it('suggests the family visa as an alternative when working and traveling with family', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, travelType: 'family' }, country),
    );
    expect(result.current.alternativeVisa?.visaId).toBe('family-greencard');
  });

  it('lowers confidence to medium when travelType is missing', () => {
    const { result } = renderHook(() =>
      useProjectRecommendations({ ...baseProject, travelType: undefined }, country),
    );
    expect(result.current.visa?.confidence).toBe('medium');
  });

  it('returns no visa when the country has no visa data', () => {
    mockedGetVisaData.mockReturnValue(undefined as any);
    const { result } = renderHook(() => useProjectRecommendations(baseProject, country));
    expect(result.current.visa).toBeNull();
  });

  describe('services', () => {
    it('builds services from priorities, deduped and tiered by rank', () => {
      const project = {
        ...baseProject,
        mainObjective: 'other',
        priorities: 'housing,employment,health,transport,finance',
      };
      const { result } = renderHook(() => useProjectRecommendations(project, country));
      const services = result.current.services;
      // First two priorities => high, next two => medium, 5th => low, plus the auto visa service.
      expect(services.find((s) => s.id === 'logement')?.priority).toBe('high');
      expect(services.find((s) => s.id === 'emploi')?.priority).toBe('high');
      expect(services.find((s) => s.id === 'sante')?.priority).toBe('medium');
      expect(services.find((s) => s.id === 'transport')?.priority).toBe('medium');
      expect(services.find((s) => s.id === 'banque')?.priority).toBe('low');
    });

    it('auto-adds a visa service when a country is set and it was not already added', () => {
      const { result } = renderHook(() => useProjectRecommendations(baseProject, country));
      expect(result.current.services.find((s) => s.id === 'visa')).toMatchObject({
        priority: 'high',
        link: '/visa?country=FR',
      });
    });

    it('auto-adds an emploi service for a work objective unless already covered by a priority', () => {
      const { result } = renderHook(() => useProjectRecommendations(baseProject, country));
      expect(result.current.services.filter((s) => s.id === 'emploi')).toHaveLength(1);
    });

    it('sorts services by priority tier (high, then medium, then low)', () => {
      const project = { ...baseProject, mainObjective: 'other', priorities: 'finance,housing' };
      const { result } = renderHook(() => useProjectRecommendations(project, country));
      const priorities = result.current.services.map((s) => s.priority);
      const order = { high: 0, medium: 1, low: 2 } as const;
      const sorted = [...priorities].sort((a, b) => order[a] - order[b]);
      expect(priorities).toEqual(sorted);
    });
  });

  describe('actionPlan', () => {
    it('includes a visa step when a country is resolved', () => {
      const { result } = renderHook(() => useProjectRecommendations(baseProject, country));
      expect(result.current.actionPlan.some((a) => a.id === 'visa-step')).toBe(true);
    });

    it('includes a job step for work and a study step for study objectives', () => {
      const work = renderHook(() => useProjectRecommendations(baseProject, country));
      expect(work.result.current.actionPlan.some((a) => a.id === 'job-step')).toBe(true);

      const study = renderHook(() =>
        useProjectRecommendations({ ...baseProject, mainObjective: 'study' }, country),
      );
      expect(study.result.current.actionPlan.some((a) => a.id === 'study-step')).toBe(true);
    });

    it('includes a housing step when a budget is set, even without the priority', () => {
      const { result } = renderHook(() =>
        useProjectRecommendations({ ...baseProject, housingBudget: 1000 }, country),
      );
      expect(result.current.actionPlan.some((a) => a.id === 'housing-step')).toBe(true);
    });

    it('includes steps for each matching priority (health, admin, integration, transport)', () => {
      const project = {
        ...baseProject,
        priorities: 'health,admin_help,social_integration,transport',
      };
      const { result } = renderHook(() => useProjectRecommendations(project, country));
      const ids = result.current.actionPlan.map((a) => a.id);
      expect(ids).toEqual(
        expect.arrayContaining([
          'health-step',
          'admin-step',
          'integration-step',
          'transport-step',
        ]),
      );
    });
  });
});
