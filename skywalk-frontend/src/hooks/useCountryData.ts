import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { countryApi } from '../api/country';
import { useTranslation } from 'react-i18next';
import countriesData from '../data/countries-data.json';
import { getCountryTranslation } from '../locales/countryTranslations';

export interface ExpatStep {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  substeps: Array<{
    id: string;
    label: string;
    isOptional: boolean;
  }>;
}

export interface Recommendation {
  title: string;
  importanceKey: string;
  description: string;
  link?: string;
  linkText?: string;
  category: string;
}

export interface CountryData {
  id: number;
  name: string;
  code: string;
  currency: string;
  currencySymbol?: string;
  languages: string[];
  flagUrl: string;
  flagEmoji: string;
  continent: string;
  capital?: string;
  expatProjectTemplate?: {
    version: string;
    steps: ExpatStep[];
  };
  oldRecommendations?: Recommendation[];
  recommendations?: {
    bestFor?: string[];
    language?: string;
    visaDifficulty?: string;
  };
  jobMarket?: {
    topSectors: string[];
    averageSalary?: number;
    unemploymentRate?: string;
    workingHoursPerWeek?: number;
    salaryByCity?: Record<string, number>;
    salaryBySector?: Record<string, number>;
    keyJobSites?: Array<{
      name: string;
      url: string;
    }>;
  };
  costOfLiving?: {
    averageRent: {
      oneBedroom?: number;
      threeBedroom?: number;
      studio?: number;
      t2?: number;
      t3?: number;
      currency?: string;
    };
    averageSalary: number;
    food?: {
      restaurantMeal?: number;
      groceriesWeekly?: number;
    };
    utilities?: number;
    transportMonthly: number;
    internetMonthly?: number;
    gymMembership?: number;
    groceriesMonthly?: number;
    currency?: string;
    byCity?: Record<string, Record<string, number>>;
  };
}

/**
 * Fiche pays statique (countries-data.json) pour un identifiant de la BASE.
 *
 * Le JSON porte ses propres `id`, écrits à la main, qui ne sont pas ceux de la
 * base — et certains sont en double (4 = Allemagne ET Japon, 5 = Canada ET
 * Espagne). Chercher `c.id === countryId` affichait donc « votre projet vers
 * Allemagne » pour un projet Japon (id 4 en base), pendant que le widget
 * Recommandations, qui interroge l'API, annonçait un visa de travail. France,
 * Suisse et États-Unis coïncidaient par chance, ce qui a masqué le défaut.
 *
 * On résout l'identifiant vers son code ISO par la liste des pays actifs (même
 * clé de cache que useSupportedCountries), et on joint par code — immunisé
 * contre toute dérive des identifiants.
 */
export function useCountryData(countryId?: number | null) {
  const { data: activeCountries } = useQuery({
    queryKey: ['countries', 'active'],
    queryFn: countryApi.getActive,
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000,
  });
  const code = useMemo(() => {
    if (!countryId) return undefined;
    return activeCountries?.find((c) => c.idCountry === countryId)?.isoCode?.toUpperCase();
  }, [activeCountries, countryId]);
  return useCountryDataByCode(code);
}

export function useCountryDataByCode(countryCode?: string) {
  const { i18n } = useTranslation();
  
  const country = useMemo(() => {
    if (!countryCode) return null;
    const rawCountry = (countriesData.countries as unknown as CountryData[]).find(
      (c) => c.code === countryCode
    );
    
    if (!rawCountry) return null;
    
    const translation = getCountryTranslation(rawCountry.code, i18n.language);
    if (translation && rawCountry.expatProjectTemplate) {
      return {
        ...rawCountry,
        name: translation.name || rawCountry.name,
        expatProjectTemplate: {
          ...rawCountry.expatProjectTemplate,
          steps: rawCountry.expatProjectTemplate.steps.map(step => {
            const stepTranslation = translation.expatSteps[step.slug];
            if (!stepTranslation) return step;
            
            return {
              ...step,
              title: stepTranslation.title,
              description: stepTranslation.description,
              substeps: step.substeps.map(substep => ({
                ...substep,
                label: stepTranslation.substeps[substep.id] || substep.label,
              })),
            };
          }),
        },
        jobMarket: rawCountry.jobMarket ? {
          ...rawCountry.jobMarket,
          topSectors: translation.jobMarket?.topSectors || rawCountry.jobMarket.topSectors,
          salaryBySector: translation.jobMarket?.salaryBySector || rawCountry.jobMarket.salaryBySector,
        } : undefined,
      };
    }
    
    return rawCountry;
  }, [countryCode, i18n.language]);

  return country;
}

export function useAllCountries() {
  return countriesData.countries as unknown as CountryData[];
}
