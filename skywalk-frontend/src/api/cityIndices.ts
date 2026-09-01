import apiClient from '../lib/api';

/** CITY-level Numbeo Quality of Life indices (null = not published by Numbeo for this city). */
export interface CityQualityOfLife {
  cityId: number;
  city: string;
  qualityOfLife: number | null;
  purchasingPower: number | null;
  safety: number | null;
  healthCare: number | null;
  costOfLiving: number | null;
  propertyPriceToIncome: number | null;
  trafficCommuteTime: number | null;
  pollution: number | null;
  climate: number | null;
  source: string;
  sourceUrl: string;
  sourceLastUpdate?: string;
  capturedAt: string;
}

/** CITY-level Numbeo property / investment indicators. */
export interface CityPropertyInvestment {
  cityId: number;
  city: string;
  priceToIncomeRatio: number | null;
  mortgageAsPctIncome: number | null;
  loanAffordabilityIndex: number | null;
  priceToRentCityCentre: number | null;
  priceToRentOutside: number | null;
  grossRentalYieldCityCentre: number | null;
  grossRentalYieldOutside: number | null;
  gdpPerCapita: number | null;
  gdpGrowthRate: number | null;
  populationGrowthRate: number | null;
  source: string;
  sourceUrl: string;
  capturedAt: string;
}

export const cityIndicesApi = {
  /** Cache-only reads (no outbound fetch server-side): null when never fetched. */
  getQualityOfLife: async (cityId: number): Promise<CityQualityOfLife | null> => {
    const { data } = await apiClient.get<CityQualityOfLife | null>(`/quality-of-life/city/${cityId}`);
    return data;
  },
  getPropertyInvestment: async (cityId: number): Promise<CityPropertyInvestment | null> => {
    const { data } = await apiClient.get<CityPropertyInvestment | null>(`/property-investment/city/${cityId}`);
    return data;
  },

  /** Admin force-fetches from Numbeo (optional slug when the DB name ≠ Numbeo's English slug). */
  fetchQualityOfLife: async (cityId: number, slug?: string): Promise<CityQualityOfLife> => {
    const { data } = await apiClient.post<CityQualityOfLife>('/quality-of-life/admin/fetch-city', {
      cityId,
      ...(slug ? { slug } : {}),
    });
    return data;
  },
  fetchPropertyInvestment: async (cityId: number, slug?: string): Promise<CityPropertyInvestment> => {
    const { data } = await apiClient.post<CityPropertyInvestment>('/property-investment/admin/fetch-city', {
      cityId,
      ...(slug ? { slug } : {}),
    });
    return data;
  },

  /** Admin manual edits (source becomes 'manuel'; a Numbeo re-fetch replaces them). */
  updateQualityOfLife: async (
    cityId: number,
    values: Partial<Record<string, number | null>>,
  ): Promise<CityQualityOfLife> => {
    const { data } = await apiClient.put<CityQualityOfLife>(`/quality-of-life/city/${cityId}`, values);
    return data;
  },
  updatePropertyInvestment: async (
    cityId: number,
    values: Partial<Record<string, number | null>>,
  ): Promise<CityPropertyInvestment> => {
    const { data } = await apiClient.put<CityPropertyInvestment>(`/property-investment/city/${cityId}`, values);
    return data;
  },
};

export default cityIndicesApi;
