import apiClient from '../lib/api';

export interface GovLink {
  id: number;
  countryCode: string;
  category: string;
  label: string;
  url: string;
  sourceQuery?: string;
  confidence: number;
  verifiedAt?: string;
  status: 'active' | 'needs_review' | 'dead';
}

export interface GovLinkGenerateResult {
  countryCode: string;
  category: string;
  url: string | null;
  label: string | null;
  confidence: number;
  status: string;
}

export const govLinksApi = {
  list: async (params?: { country?: string; category?: string; status?: string }): Promise<GovLink[]> => {
    const { data } = await apiClient.get<GovLink[]>('/gov-links', { params });
    return data;
  },
  generate: async (country: string, category: string): Promise<GovLinkGenerateResult> => {
    const { data } = await apiClient.post<GovLinkGenerateResult>('/gov-links/generate', null, { params: { country, category } });
    return data;
  },
};

export default govLinksApi;
