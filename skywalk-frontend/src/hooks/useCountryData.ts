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
  languages: string[];
  flagUrl: string;
  flagEmoji: string;
  continent: string;
  capital?: string;
  expatProjectTemplate?: {
    version: string;
    steps: ExpatStep[];
  };
  recommendations?: Recommendation[];
  costOfLiving?: {
    averageRent: {
      studio: number;
      t2: number;
      t3: number;
      currency: string;
    };
    averageSalary: number;
    transportMonthly: number;
    groceriesMonthly: number;
    currency: string;
  };
}

export function useCountryData(countryId?: number | null) {
  const country = useMemo(() => {
    if (!countryId) return null;
    return (countriesData.countries as CountryData[]).find(
      (c) => c.id === countryId
    );
  }, [countryId]);

  return country;
}

export function useCountryDataByCode(countryCode?: string) {
  const country = useMemo(() => {
    if (!countryCode) return null;
    return (countriesData.countries as CountryData[]).find(
      (c) => c.code === countryCode
    );
  }, [countryCode]);

  return country;
}

export function useAllCountries() {
  return countriesData.countries as CountryData[];
}
