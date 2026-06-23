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
  summary?: string[];
}

export interface GovLinkGenerateResult {
  countryCode: string;
  category: string;
  url: string | null;
  label: string | null;
  confidence: number;
  status: string;
}

export interface GovLinksHealth {
  llm: { ok: boolean; model: string; baseUrl: string };
  search: { ok: boolean; provider: string };
}

export interface GenerationRunResultItem {
  category: string;
  result: 'verified' | 'needs_review' | 'failed' | null;
  url: string | null;
  confidence: number | null;
  message: string | null;
}

export interface GenerationRun {
  id: number;
  countryCode: string;
  status: 'running' | 'done' | 'failed';
  total: number;
  results: GenerationRunResultItem[];
  startedAt: string;
  finishedAt: string | null;
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
  health: async (): Promise<GovLinksHealth> => {
    const { data } = await apiClient.get<GovLinksHealth>('/gov-links/health');
    return data;
  },
  generateCountry: async (country: string): Promise<{ runId: number }> => {
    const { data } = await apiClient.post<{ runId: number }>('/gov-links/generate-country', null, { params: { country } });
    return data;
  },
  getRun: async (id: number): Promise<GenerationRun> => {
    const { data } = await apiClient.get<GenerationRun>(`/gov-links/runs/${id}`);
    return data;
  },
  getLatestRun: async (country: string): Promise<GenerationRun | null> => {
    try {
      const { data } = await apiClient.get<GenerationRun>('/gov-links/runs/latest', { params: { country } });
      return data;
    } catch (e: any) {
      if (e.response?.status === 404) return null;
      throw e;
    }
  },
  rerunCategory: async (runId: number, category: string): Promise<GenerationRun> => {
    const { data } = await apiClient.post<GenerationRun>(`/gov-links/runs/${runId}/rerun`, null, { params: { category } });
    return data;
  },
};

export default govLinksApi;
