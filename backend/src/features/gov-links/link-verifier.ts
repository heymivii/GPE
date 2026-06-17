import axios from 'axios';

export interface ProbeResult { ok: boolean; finalUrl: string; text: string; }
export type HttpProbe = (url: string) => Promise<ProbeResult>;

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

const defaultProbe: HttpProbe = async (url) => {
  try {
    const res = await axios.get<string>(url, {
      timeout: 10000,
      maxRedirects: 5,
      responseType: 'text',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SkyWalkBot/1.0)' },
      validateStatus: (s) => s >= 200 && s < 400,
    });
    const finalUrl = res.request?.res?.responseUrl ?? url;
    return { ok: true, finalUrl, text: typeof res.data === 'string' ? res.data : '' };
  } catch {
    return { ok: false, finalUrl: '', text: '' };
  }
};

export class LinkVerifier {
  constructor(private readonly probe: HttpProbe = defaultProbe) {}

  async verify(url: string, keywords: string[]): Promise<{ live: boolean; finalUrl: string; matched: boolean }> {
    const r = await this.probe(url);
    if (!r.ok) return { live: false, finalUrl: '', matched: false };
    const hay = extractText(r.text);
    const matched = keywords.length === 0 || keywords.some((k) => hay.includes(k.toLowerCase()));
    return { live: true, finalUrl: r.finalUrl || url, matched };
  }
}
