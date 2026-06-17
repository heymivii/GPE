import axios from 'axios';
import { SearchCandidate } from './gov-links.types';

export interface SearchProvider {
  search(query: string, allowedDomains: string[]): Promise<SearchCandidate[]>;
}

export class TavilySearchProvider implements SearchProvider {
  constructor(
    private readonly apiKey = process.env.TAVILY_API_KEY ?? '',
    private readonly baseUrl = 'https://api.tavily.com',
  ) {}

  async search(query: string, allowedDomains: string[]): Promise<SearchCandidate[]> {
    if (!this.apiKey) return [];
    const { data } = await axios.post<{ results?: Array<{ url: string; title: string; content: string }> }>(
      `${this.baseUrl}/search`,
      {
        api_key: this.apiKey,
        query,
        max_results: 8,
        include_domains: allowedDomains.length ? allowedDomains : undefined,
      },
      { timeout: 15000 },
    );
    return (data.results ?? []).map((r) => ({ url: r.url, title: r.title, snippet: r.content }));
  }
}
