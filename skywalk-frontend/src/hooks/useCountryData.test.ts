import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

let mockLanguage = 'fr';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: mockLanguage } }),
}));

vi.mock('../data/countries-data.json', () => ({
  default: {
    countries: [
      {
        id: 1,
        code: 'FR',
        name: 'France',
        expatProjectTemplate: {
          version: '1',
          steps: [
            {
              id: 1,
              slug: 'visa',
              title: 'Visa (EN)',
              description: 'Get a visa',
              category: 'admin',
              order: 1,
              substeps: [{ id: 'doc1', label: 'Gather docs', isOptional: false }],
            },
            {
              id: 2,
              slug: 'housing',
              title: 'Housing (EN)',
              description: 'Find a place',
              category: 'housing',
              order: 2,
              substeps: [],
            },
          ],
        },
        jobMarket: { topSectors: ['tech'], salaryBySector: { tech: 50000 } },
      },
      { id: 2, code: 'ZZ', name: 'Nowhere' },
    ],
  },
}));

vi.mock('../locales/countryTranslations', () => ({
  getCountryTranslation: vi.fn(),
}));

import { getCountryTranslation } from '../locales/countryTranslations';
import {
  useCountryData,
  useCountryDataByCode,
  useAllCountries,
} from './useCountryData';

const mockedGetTranslation = vi.mocked(getCountryTranslation);

describe('useCountryData', () => {
  beforeEach(() => {
    mockLanguage = 'fr';
    mockedGetTranslation.mockReturnValue(null);
  });

  it('returns null when no countryId is given', () => {
    const { result } = renderHook(() => useCountryData(undefined));
    expect(result.current).toBeNull();
  });

  it('returns null when the countryId does not match any country', () => {
    const { result } = renderHook(() => useCountryData(999));
    expect(result.current).toBeNull();
  });

  it('returns the raw country when there is no translation', () => {
    const { result } = renderHook(() => useCountryData(1));
    expect(result.current?.name).toBe('France');
    expect(result.current?.expatProjectTemplate?.steps[0].title).toBe('Visa (EN)');
  });

  it('merges the translated name, step title/description, and substep labels', () => {
    mockedGetTranslation.mockReturnValue({
      name: 'La France',
      expatSteps: {
        visa: {
          title: 'Visa (FR)',
          description: 'Obtenir un visa',
          substeps: { doc1: 'Rassembler les documents' },
        },
      },
    });

    const { result } = renderHook(() => useCountryData(1));

    expect(result.current?.name).toBe('La France');
    const [visaStep, housingStep] = result.current!.expatProjectTemplate!.steps;
    expect(visaStep.title).toBe('Visa (FR)');
    expect(visaStep.description).toBe('Obtenir un visa');
    expect(visaStep.substeps[0].label).toBe('Rassembler les documents');
    // Step with no translation entry falls back to the raw (English) step untouched.
    expect(housingStep.title).toBe('Housing (EN)');
  });

  it('falls back to the raw substep label when the translation omits it', () => {
    mockedGetTranslation.mockReturnValue({
      name: 'La France',
      expatSteps: {
        visa: {
          title: 'Visa (FR)',
          description: 'Obtenir un visa',
          substeps: {},
        },
      },
    });

    const { result } = renderHook(() => useCountryData(1));
    expect(result.current?.expatProjectTemplate?.steps[0].substeps[0].label).toBe(
      'Gather docs',
    );
  });

  it('merges translated jobMarket fields, falling back to raw when absent', () => {
    mockedGetTranslation.mockReturnValue({
      name: 'La France',
      expatSteps: {},
      jobMarket: { topSectors: ['technologie'] },
    });

    const { result } = renderHook(() => useCountryData(1));
    expect(result.current?.jobMarket?.topSectors).toEqual(['technologie']);
    // salaryBySector has no translation entry → falls back to the raw value.
    expect(result.current?.jobMarket?.salaryBySector).toEqual({ tech: 50000 });
  });

  it('does not merge translations when the country has no expatProjectTemplate', () => {
    mockedGetTranslation.mockReturnValue({
      name: 'Nulle part (FR)',
      expatSteps: {},
    });
    const { result } = renderHook(() => useCountryData(2));
    // No expatProjectTemplate on the raw country → merge branch is skipped entirely.
    expect(result.current?.name).toBe('Nowhere');
  });
});

describe('useCountryDataByCode', () => {
  beforeEach(() => {
    mockLanguage = 'fr';
    mockedGetTranslation.mockReturnValue(null);
  });

  it('returns null when no code is given', () => {
    const { result } = renderHook(() => useCountryDataByCode(undefined));
    expect(result.current).toBeNull();
  });

  it('returns null when the code does not match any country', () => {
    const { result } = renderHook(() => useCountryDataByCode('ZZZ'));
    expect(result.current).toBeNull();
  });

  it('finds the country by its code', () => {
    const { result } = renderHook(() => useCountryDataByCode('FR'));
    expect(result.current?.id).toBe(1);
  });

  it('merges the translated name, step title/description, and substep labels', () => {
    mockedGetTranslation.mockReturnValue({
      name: 'La France',
      expatSteps: {
        visa: {
          title: 'Visa (FR)',
          description: 'Obtenir un visa',
          substeps: { doc1: 'Rassembler les documents' },
        },
      },
    });

    const { result } = renderHook(() => useCountryDataByCode('FR'));

    expect(result.current?.name).toBe('La France');
    const [visaStep, housingStep] = result.current!.expatProjectTemplate!.steps;
    expect(visaStep.title).toBe('Visa (FR)');
    expect(visaStep.description).toBe('Obtenir un visa');
    expect(visaStep.substeps[0].label).toBe('Rassembler les documents');
    expect(housingStep.title).toBe('Housing (EN)');
  });

  it('merges translated jobMarket fields, falling back to raw when absent', () => {
    mockedGetTranslation.mockReturnValue({
      name: 'La France',
      expatSteps: {},
      jobMarket: { topSectors: ['technologie'] },
    });

    const { result } = renderHook(() => useCountryDataByCode('FR'));
    expect(result.current?.jobMarket?.topSectors).toEqual(['technologie']);
    expect(result.current?.jobMarket?.salaryBySector).toEqual({ tech: 50000 });
  });

  it('does not merge translations when the country has no expatProjectTemplate', () => {
    mockedGetTranslation.mockReturnValue({ name: 'Nulle part (FR)', expatSteps: {} });
    const { result } = renderHook(() => useCountryDataByCode('ZZ'));
    expect(result.current?.name).toBe('Nowhere');
  });
});

describe('useAllCountries', () => {
  it('returns the full raw country list', () => {
    const { result } = renderHook(() => useAllCountries());
    expect(result.current).toHaveLength(2);
  });
});
