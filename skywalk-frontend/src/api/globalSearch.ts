import apiClient from '../lib/api';

export type SearchCategory =
  | 'country'
  | 'city'
  | 'guide'
  | 'checklist'
  | 'resource'
  | 'forum'
  | 'procedure'
  | 'service'
  | 'faq'
  | 'blog';

export interface GlobalSearchResult {
  category: SearchCategory;
  entityId: string;
  title: string;
  description: string;
  extra: string;
  url: string | null;
  countryName: string;
  imageUrl: string | null;
  rank: number;
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[];
  total: number;
  query: string;
}

export const globalSearchApi = {
  async search(
    q: string,
    category?: SearchCategory,
    limit = 10,
  ): Promise<GlobalSearchResponse> {
    const params: Record<string, string | number> = { q, limit };
    if (category) params.category = category;
    const { data } = await apiClient.get<GlobalSearchResponse>(
      '/global-search',
      { params },
    );
    return data;
  },
};

export default globalSearchApi;
