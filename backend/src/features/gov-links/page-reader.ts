import axios from 'axios';

export function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Turns a fetched page into clean, LLM-readable text. Swappable via PAGE_READER env.
export interface PageReader {
  // url = final (already validated) URL; rawHtml = HTML already fetched by the liveness probe.
  read(url: string, rawHtml: string): Promise<string>;
}

// Default: offline, zero-dependency. Strips markup from the HTML we already have.
export class LocalPageReader implements PageReader {
  async read(_url: string, rawHtml: string): Promise<string> {
    return extractText(rawHtml);
  }
}

// Free, keyless: GET https://r.jina.ai/<url> returns clean Markdown of the page.
export class JinaPageReader implements PageReader {
  constructor(
    private readonly baseUrl = process.env.JINA_BASE_URL ?? 'https://r.jina.ai',
  ) {}
  async read(url: string, rawHtml: string): Promise<string> {
    try {
      const { data } = await axios.get<string>(`${this.baseUrl}/${url}`, {
        timeout: 20000,
        responseType: 'text',
        headers: { Accept: 'text/plain' },
      });
      const clean = (typeof data === 'string' ? data : '').toLowerCase().trim();
      return clean || extractText(rawHtml); // empty → fall back to local
    } catch {
      return extractText(rawHtml); // network failure → don't lose the candidate
    }
  }
}
