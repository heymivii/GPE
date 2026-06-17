import apiClient from '../lib/api';

// Country-level property / investment indicators (Numbeo, cached server-side).
export interface PropertyInvestmentData {
  priceToIncomeRatio: number | null;
  mortgageAsPctIncome: number | null; // %
  loanAffordabilityIndex: number | null;
  priceToRentCityCentre: number | null;
  priceToRentOutside: number | null;
  grossRentalYieldCityCentre: number | null; // %
  grossRentalYieldOutside: number | null; // %
  gdpPerCapita: number | null; // USD
  gdpGrowthRate: number | null; // %
  populationGrowthRate: number | null; // %
  country: string;
  source: string;
  sourceUrl: string;
  capturedAt: string;
}

export const propertyInvestmentApi = {
  // `country` accepts an ISO2 code (FR/US/JP/CH) or English name — the backend maps it.
  get: async (country: string): Promise<PropertyInvestmentData> => {
    const res = await apiClient.get<PropertyInvestmentData>('/property-investment', {
      params: { country },
    });
    return res.data;
  },
};
