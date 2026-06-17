import apiClient from '../lib/api';

// Country-level Quality of Life indices (Numbeo, DB-cached server-side).
export interface QualityOfLifeData {
  qualityOfLife: number | null;
  purchasingPower: number | null;
  safety: number | null;
  healthCare: number | null;
  costOfLiving: number | null;
  propertyPriceToIncome: number | null;
  trafficCommuteTime: number | null;
  pollution: number | null;
  climate: number | null;
  country: string;
  source: string;
  sourceUrl: string;
  sourceLastUpdate?: string;
  capturedAt: string;
}

export const qualityOfLifeApi = {
  // `country` accepts an ISO2 code (FR/US/JP/CH) or English name — the backend maps it.
  get: async (country: string): Promise<QualityOfLifeData> => {
    const res = await apiClient.get<QualityOfLifeData>('/quality-of-life', {
      params: { country },
    });
    return res.data;
  },
};
