export interface GlobalSearchResult {
  category: string;
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
