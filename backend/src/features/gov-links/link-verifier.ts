import axios from 'axios';
import { PageReader, LocalPageReader } from './page-reader';

export { extractText, extractReadableText } from './page-reader';

/**
 * Volume de texte conservé pour l'étage IA. L'ancien plafond de 4 000 caractères
 * tronquait au DÉBUT de la page — donc souvent dans le chapeau, avant la procédure.
 * On en garde davantage et c'est `selectRelevantExcerpt` qui choisit la bonne zone.
 */
export const MAX_PAGE_TEXT = 20000;
export interface ProbeResult {
  ok: boolean;
  finalUrl: string;
  text: string;
  /** true = texte déjà propre (markdown r.jina.ai) — inutile de repasser par le reader. */
  clean?: boolean;
}
export type HttpProbe = (url: string) => Promise<ProbeResult>;

/**
 * Sonde de SECOURS anti-blocage. Certains sites gouvernementaux (france-visas.gouv.fr)
 * refusent les robots déclarés : 403 + challenge JavaScript pour notre User-Agent
 * « SkyWalkBot ». Conséquence observée : tous leurs candidats mouraient à la
 * vérification et le ranker se rabattait sur une page de moindre qualité (campusfrance
 * à 0.30 pour la catégorie visa). Plutôt que de nous déguiser en navigateur, on passe
 * par r.jina.ai — un lecteur public qui rend la page et renvoie son texte en Markdown.
 */
const JINA_MIN_TEXT_CHARS = 500;
export const jinaFallbackProbe: HttpProbe = async (url) => {
  try {
    const base = process.env.JINA_BASE_URL ?? 'https://r.jina.ai';
    const res = await axios.get<string>(`${base}/${url}`, {
      timeout: 25000,
      responseType: 'text',
      headers: { Accept: 'text/plain' },
    });
    const text = (typeof res.data === 'string' ? res.data : '').trim();
    // Un challenge relayé ou une coquille vide restent des échecs : il faut du contenu.
    if (text.length < JINA_MIN_TEXT_CHARS) {
      return { ok: false, finalUrl: '', text: '' };
    }
    return { ok: true, finalUrl: url, text, clean: true };
  } catch {
    return { ok: false, finalUrl: '', text: '' };
  }
};

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
    return {
      ok: true,
      finalUrl,
      text: typeof res.data === 'string' ? res.data : '',
    };
  } catch {
    return { ok: false, finalUrl: '', text: '' };
  }
};

export class LinkVerifier {
  constructor(
    private readonly probe: HttpProbe = defaultProbe,
    private readonly reader: PageReader = new LocalPageReader(),
  ) {}

  async verify(
    url: string,
    keywords: string[],
  ): Promise<{
    live: boolean;
    finalUrl: string;
    matched: boolean;
    text: string;
  }> {
    let r = await this.probe(url);
    // Refus du fetch direct (403 anti-robot, réseau…) → seconde chance via r.jina.ai.
    if (!r.ok) r = await jinaFallbackProbe(url);
    if (!r.ok) return { live: false, finalUrl: '', matched: false, text: '' };
    const finalUrl = r.finalUrl || url;
    // `read()` renvoie désormais le texte AVEC sa casse (le modèle en a besoin) : la
    // comparaison de mots-clés neutralise la casse ici, au moment de comparer.
    // Le texte du secours Jina est déjà du Markdown propre — pas de reader dessus.
    const readable = r.clean
      ? r.text
      : await this.reader.read(finalUrl, r.text);
    const hay = readable.toLowerCase();
    const matched =
      keywords.length === 0 ||
      keywords.some((k) => hay.includes(k.toLowerCase()));
    return {
      live: true,
      finalUrl,
      matched,
      text: readable.slice(0, MAX_PAGE_TEXT),
    };
  }
}
