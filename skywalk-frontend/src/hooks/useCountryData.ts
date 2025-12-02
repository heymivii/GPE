import { useMemo } from 'react';
import countriesData from '../data/countries-data.json';

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
  importance: 'Urgent' | 'Important' | 'À faire';
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
  const country = useMemo(() => {
    if (!countryId) return null;
    return (countriesData.countries as unknown as CountryData[]).find(
      (c) => c.id === countryId
    );
  }, [countryId]);

  return country;
}

export function useCountryDataByCode(countryCode?: string) {
  const country = useMemo(() => {
    if (!countryCode) return null;
    return (countriesData.countries as unknown as CountryData[]).find(
      (c) => c.code === countryCode
    );
  }, [countryCode]);

  return country;
}

export function useAllCountries() {
  return countriesData.countries as unknown as CountryData[];
}
