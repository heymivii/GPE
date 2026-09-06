import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let mockLanguage = 'fr';
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: mockLanguage } }),
}));

// L'identifiant de la base se résout en code ISO par l'API — jamais par l'id du JSON.
vi.mock('../api/country', async () => {
  // Une ligne par identifiant, comme la base : l'entrée Allemagne (id 4 en double
  // dans le JSON) n'existe pas côté API — c'est le Japon qui porte l'id 4.
  const { default: data } = await import('../data/countries-data.json');
  const rows = (data as { countries: { id: number; code: string; name: string }[] }).countries
    .filter((c) => c.code !== 'DE')
    .map((c) => ({ idCountry: c.id, isoCode: c.code, countryName: c.name }));
  return { countryApi: { getActive: vi.fn().mockResolvedValue(rows) } };
});

vi.mock('../data/countries-data.json', () => ({
  default: {
    countries: [
      { id: 4, code: 'DE', name: 'Allemagne' },
      { id: 4, code: 'JP', name: 'Japon' },
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


function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

describe('useCountryData', () => {
  beforeEach(() => {
    mockLanguage = 'fr';
    mockedGetTranslation.mockReturnValue(null);
  });

  it('returns null when no countryId is given', async () => {
    const { result } = renderHook(() => useCountryData(undefined), { wrapper });
    expect(result.current).toBeNull();
  });

  it('returns null when the countryId does not match any country', async () => {
    const { result } = renderHook(() => useCountryData(999), { wrapper });
    expect(result.current).toBeNull();
  });

  it('returns the raw country when there is no translation', async () => {
    const { result } = renderHook(() => useCountryData(1), { wrapper });
    await waitFor(() => expect(result.current).not.toBeNull());
    await waitFor(() => expect(result.current?.name).toBe('France'));
    await waitFor(() => expect(result.current?.expatProjectTemplate?.steps[0].title).toBe('Visa (EN)'));
  });

  it('merges the translated name, step title/description, and substep labels', async () => {
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

    const { result } = renderHook(() => useCountryData(1), { wrapper });
    await waitFor(() => expect(result.current).not.toBeNull());

    await waitFor(() => expect(result.current?.name).toBe('La France'));
    const [visaStep, housingStep] = result.current!.expatProjectTemplate!.steps;
    expect(visaStep.title).toBe('Visa (FR)');
    expect(visaStep.description).toBe('Obtenir un visa');
    expect(visaStep.substeps[0].label).toBe('Rassembler les documents');
    // Step with no translation entry falls back to the raw (English) step untouched.
    expect(housingStep.title).toBe('Housing (EN)');
  });

  it('falls back to the raw substep label when the translation omits it', async () => {
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

    const { result } = renderHook(() => useCountryData(1), { wrapper });
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current?.expatProjectTemplate?.steps[0].substeps[0].label).toBe(
      'Gather docs',
    );
  });

  it('merges translated jobMarket fields, falling back to raw when absent', async () => {
    mockedGetTranslation.mockReturnValue({
      name: 'La France',
      expatSteps: {},
      jobMarket: { topSectors: ['technologie'] },
    });

    const { result } = renderHook(() => useCountryData(1), { wrapper });
    await waitFor(() => expect(result.current).not.toBeNull());
    await waitFor(() => expect(result.current?.jobMarket?.topSectors).toEqual(['technologie']));
    // salaryBySector has no translation entry → falls back to the raw value.
    await waitFor(() => expect(result.current?.jobMarket?.salaryBySector).toEqual({ tech: 50000 }));
  });

  it('does not merge translations when the country has no expatProjectTemplate', async () => {
    mockedGetTranslation.mockReturnValue({
      name: 'Nulle part (FR)',
      expatSteps: {},
    });
    const { result } = renderHook(() => useCountryData(2), { wrapper });
    await waitFor(() => expect(result.current).not.toBeNull());
    // No expatProjectTemplate on the raw country → merge branch is skipped entirely.
    await waitFor(() => expect(result.current?.name).toBe('Nowhere'));
  });
});

describe('useCountryDataByCode', () => {
  beforeEach(() => {
    mockLanguage = 'fr';
    mockedGetTranslation.mockReturnValue(null);
  });

  it('returns null when no code is given', async () => {
    const { result } = renderHook(() => useCountryDataByCode(undefined));
    expect(result.current).toBeNull();
  });

  it('returns null when the code does not match any country', async () => {
    const { result } = renderHook(() => useCountryDataByCode('ZZZ'));
    expect(result.current).toBeNull();
  });

  it('finds the country by its code', async () => {
    const { result } = renderHook(() => useCountryDataByCode('FR'));
    await waitFor(() => expect(result.current?.id).toBe(1));
  });

  it('merges the translated name, step title/description, and substep labels', async () => {
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

    await waitFor(() => expect(result.current?.name).toBe('La France'));
    const [visaStep, housingStep] = result.current!.expatProjectTemplate!.steps;
    expect(visaStep.title).toBe('Visa (FR)');
    expect(visaStep.description).toBe('Obtenir un visa');
    expect(visaStep.substeps[0].label).toBe('Rassembler les documents');
    expect(housingStep.title).toBe('Housing (EN)');
  });

  it('merges translated jobMarket fields, falling back to raw when absent', async () => {
    mockedGetTranslation.mockReturnValue({
      name: 'La France',
      expatSteps: {},
      jobMarket: { topSectors: ['technologie'] },
    });

    const { result } = renderHook(() => useCountryDataByCode('FR'));
    await waitFor(() => expect(result.current?.jobMarket?.topSectors).toEqual(['technologie']));
    await waitFor(() => expect(result.current?.jobMarket?.salaryBySector).toEqual({ tech: 50000 }));
  });

  it('does not merge translations when the country has no expatProjectTemplate', async () => {
    mockedGetTranslation.mockReturnValue({ name: 'Nulle part (FR)', expatSteps: {} });
    const { result } = renderHook(() => useCountryDataByCode('ZZ'));
    await waitFor(() => expect(result.current?.name).toBe('Nowhere'));
  });
});

describe('useAllCountries', () => {
  it('returns the full raw country list', async () => {
    const { result } = renderHook(() => useAllCountries());
    // France, Nowhere, et les deux entrées d'id 4 (Allemagne / Japon) de la non-régression.
    expect(result.current).toHaveLength(4);
  });

  // Retour de recette : « y a un bug, pourquoi Allemagne ? » — projet Japon (id 4 en base),
  // tableau de bord « vers Allemagne » : le JSON porte deux entrées d'id 4.
  it('résout l’identifiant par le code ISO de la base, pas par l’id du JSON', async () => {
    const { result } = renderHook(() => useCountryData(4), { wrapper });
    await waitFor(() => expect(result.current).not.toBeNull());
    await waitFor(() => expect(result.current?.code).toBe('JP'));
    expect(result.current?.name).toBe('Japon');
  });
});
