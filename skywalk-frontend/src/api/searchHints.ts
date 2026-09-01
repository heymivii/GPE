import apiClient from '../lib/api';

/** A fiche of the editable "search address book": one per (countryCode, category). */
export interface SearchHint {
  id: number;
  countryCode: string;
  category: string;
  officialDomains: string[];
  keywords: string;
  queryLang: string;
  excludeTerms: string[];
  pinnedUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a fiche. Only countryCode + category are required server-side. */
export interface CreateSearchHintInput {
  countryCode: string;
  category: string;
  officialDomains?: string[];
  keywords?: string;
  queryLang?: string;
  excludeTerms?: string[];
  pinnedUrl?: string | null;
}

/** Payload for editing a fiche — everything except the (countryCode, category) key. */
export type UpdateSearchHintInput = Partial<Omit<CreateSearchHintInput, 'countryCode' | 'category'>>;

export interface SeedResult {
  inserted: number;
  skipped: number;
  total: number;
}

export const searchHintsApi = {
  list: async (params?: { country?: string; category?: string }): Promise<SearchHint[]> => {
    const { data } = await apiClient.get<SearchHint[]>('/search-hint', { params });
    return data;
  },
  get: async (cc: string, cat: string): Promise<SearchHint> => {
    const { data } = await apiClient.get<SearchHint>(`/search-hint/${cc}/${cat}`);
    return data;
  },
  create: async (input: CreateSearchHintInput): Promise<SearchHint> => {
    const { data } = await apiClient.post<SearchHint>('/search-hint', input);
    return data;
  },
  update: async (cc: string, cat: string, patch: UpdateSearchHintInput): Promise<SearchHint> => {
    const { data } = await apiClient.patch<SearchHint>(`/search-hint/${cc}/${cat}`, patch);
    return data;
  },
  remove: async (cc: string, cat: string): Promise<{ deleted: boolean }> => {
    const { data } = await apiClient.delete<{ deleted: boolean }>(`/search-hint/${cc}/${cat}`);
    return data;
  },
  // INSERT-ONLY: restores missing seed fiches; never overwrites edits or pinnedUrl.
  seed: async (): Promise<SeedResult> => {
    const { data } = await apiClient.post<SeedResult>('/search-hint/seed');
    return data;
  },
};

export default searchHintsApi;
