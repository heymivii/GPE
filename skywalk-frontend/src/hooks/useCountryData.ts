import { useMemo } from 'react';
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

export function useCountryData(countryId?: number | null) {
  const { i18n } = useTranslation();
  
  const country = useMemo(() => {
    if (!countryId) return null;
    const rawCountry = (countriesData.countries as unknown as CountryData[]).find(
      (c) => c.id === countryId
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
  }, [countryId, i18n.language]);

  return country;
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
