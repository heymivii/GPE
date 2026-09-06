import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCountryName } from './useCountryName';

// Registre des pays ACTIFS : le Japon en est absent, comme en base une fois
// le pays archivé. C'est le cas qui doit passer par le repli i18n.
vi.mock('../data/countryMappings', () => ({
  resolveCountry: (name: string) =>
    name === 'France' ? { i18nKey: 'countries.france', name: 'France' } : undefined,
}));

const i18nState: {
  language: string;
  resolvedLanguage?: string;
  bundles: Record<string, unknown>;
} = { language: 'fr', bundles: {} };

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const table: Record<string, string> = {
        'countries.france': 'France',
        'countries.japan': 'Japon',
      };
      return table[key] ?? opts?.defaultValue ?? key;
    },
    i18n: {
      language: i18nState.language,
      resolvedLanguage: i18nState.resolvedLanguage,
      getResourceBundle: (l: string) => i18nState.bundles[l],
    },
  }),
}));

const BUNDLE_FR = { countries: { france: 'France', japan: 'Japon' } };

describe('useCountryName', () => {
  beforeEach(() => {
    i18nState.language = 'fr';
    i18nState.resolvedLanguage = undefined;
    i18nState.bundles = { fr: BUNDLE_FR };
  });

  it('traduit un pays présent dans le registre des pays actifs', () => {
    const { result } = renderHook(() => useCountryName());
    expect(result.current('France')).toBe('France');
  });

  it('traduit un pays archivé via le repli sur le bundle i18n', () => {
    const { result } = renderHook(() => useCountryName());
    expect(result.current('Japan')).toBe('Japon');
  });

  it('retrouve le bundle quand le navigateur donne une étiquette régionale', () => {
    // Le détecteur renseigne « fr-FR » alors que les ressources sont sous « fr ».
    // Sans repli sur le sous-tag, la table restait vide et la page d'accueil
    // affichait « nos destinations : France, Japan » en interface française.
    i18nState.language = 'fr-FR';
    i18nState.bundles = { fr: BUNDLE_FR };

    const { result } = renderHook(() => useCountryName());
    expect(result.current('Japan')).toBe('Japon');
  });

  it('préfère la langue résolue quand i18next la fournit', () => {
    i18nState.language = 'fr-FR';
    i18nState.resolvedLanguage = 'fr';
    i18nState.bundles = { fr: BUNDLE_FR };

    const { result } = renderHook(() => useCountryName());
    expect(result.current('Japan')).toBe('Japon');
  });

  it('retombe sur le nom d’origine plutôt que sur une clé technique', () => {
    const { result } = renderHook(() => useCountryName());
    expect(result.current('Wakanda')).toBe('Wakanda');
  });

  it('ne plante pas si i18n est absent du mock', () => {
    i18nState.bundles = {};
    const { result } = renderHook(() => useCountryName());
    expect(result.current('Japan')).toBe('Japan');
  });
});
