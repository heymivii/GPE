import axios from 'axios';
import { toReadableText, dropMenuLines } from './quality/readable-text';

/**
 * Texte LISIBLE d'une page : casse préservée, navigation et habillage retirés.
 *
 * C'est ce que reçoit le modèle. La casse portait un signal décisif — « CERFA »,
 * « CPAM », « PUMa », « France Travail » — que l'ancienne version détruisait en
 * passant tout en minuscules avant l'appel au LLM.
 */
export function extractReadableText(html: string): string {
  return dropMenuLines(toReadableText(html ?? ''));
}

/**
 * Forme MINUSCULE, à réserver à la comparaison de mots-clés. Conservée pour la
 * détection de pertinence du LinkVerifier ; ne jamais l'envoyer au modèle.
 */
export function extractText(html: string): string {
  return extractReadableText(html).replace(/\s+/g, ' ').trim().toLowerCase();
}

// Turns a fetched page into clean, LLM-readable text (CASE PRESERVED). Swappable via PAGE_READER env.
export interface PageReader {
  // url = final (already validated) URL; rawHtml = HTML already fetched by the liveness probe.
  read(url: string, rawHtml: string): Promise<string>;
}

// Default: offline, zero-dependency. Strips markup from the HTML we already have.
export class LocalPageReader implements PageReader {
  async read(_url: string, rawHtml: string): Promise<string> {
    return extractReadableText(rawHtml);
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
      const clean = (typeof data === 'string' ? data : '').trim();
      return clean || extractReadableText(rawHtml); // empty → fall back to local
    } catch {
      return extractReadableText(rawHtml); // network failure → don't lose the candidate
    }
  }
}
