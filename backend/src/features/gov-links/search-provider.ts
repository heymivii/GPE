import axios from 'axios';
import { SearchCandidate } from './gov-links.types';

export interface SearchProvider {
  search(query: string, allowedDomains: string[]): Promise<SearchCandidate[]>;
  health(): Promise<boolean>;
}

export class SearxngSearchProvider implements SearchProvider {
  constructor(
    private readonly baseUrl = process.env.SEARXNG_BASE_URL ??
      'http://localhost:8888',
  ) {}

  async search(
    query: string,
    _allowedDomains: string[],
  ): Promise<SearchCandidate[]> {
    const { data } = await axios.get<{
      results?: Array<{ url: string; title: string; content: string }>;
    }>(`${this.baseUrl}/search`, {
      params: { q: query, format: 'json' },
      timeout: 15000,
    });
    return (data.results ?? []).map((r) => ({
      url: r.url,
      title: r.title,
      snippet: r.content,
    }));
  }

  async health(): Promise<boolean> {
    try {
      await axios.get(this.baseUrl, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}

export class TavilySearchProvider implements SearchProvider {
  constructor(
    private readonly apiKey = process.env.TAVILY_API_KEY ?? '',
    private readonly baseUrl = 'https://api.tavily.com',
  ) {}

  async search(
    query: string,
    allowedDomains: string[],
  ): Promise<SearchCandidate[]> {
    if (!this.apiKey) return [];
    const { data } = await axios.post<{
      results?: Array<{ url: string; title: string; content: string }>;
    }>(
      `${this.baseUrl}/search`,
      {
        api_key: this.apiKey,
        query,
        max_results: 8,
        include_domains: allowedDomains.length ? allowedDomains : undefined,
      },
      { timeout: 15000 },
    );
    return (data.results ?? []).map((r) => ({
      url: r.url,
      title: r.title,
      snippet: r.content,
    }));
  }

  // Tavily is a remote keyed API — "reachable" means configured.
  async health(): Promise<boolean> {
    return this.apiKey.length > 0;
  }
}
