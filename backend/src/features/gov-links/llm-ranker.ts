import axios from 'axios';
import { SearchCandidate, RankResult } from './gov-links.types';

export interface LlmRanker {
  pickBest(
    query: string,
    candidates: SearchCandidate[],
  ): Promise<RankResult | null>;
  summarize(
    pageText: string,
    context: { country: string; category: string },
  ): Promise<string[]>;
  health(): Promise<boolean>;
}

// Anti-hallucination guard: the model may only return an index INTO the candidate list.
export function clampRankResult(
  raw: RankResult,
  candidates: SearchCandidate[],
): RankResult | null {
  if (
    !Number.isInteger(raw.index) ||
    raw.index < 0 ||
    raw.index >= candidates.length
  )
    return null;
  return {
    index: raw.index,
    label: String(raw.label ?? '').slice(0, 200),
    confidence: Math.max(0, Math.min(1, raw.confidence ?? 0)),
  };
}

export class OllamaRanker implements LlmRanker {
  constructor(
    private readonly baseUrl = process.env.LLM_BASE_URL ??
      'http://localhost:11434/v1',
    private readonly model = process.env.LLM_MODEL ?? 'qwen2.5:7b-instruct',
    private readonly apiKey = process.env.LLM_API_KEY ?? 'ollama',
  ) {}

  async health(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/models`, {
        timeout: 3000,
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return true;
    } catch {
      return false;
    }
  }

  async summarize(
    pageText: string,
    context: { country: string; category: string },
  ): Promise<string[]> {
    const text = (pageText ?? '').slice(0, 4000);
    if (!text.trim()) return [];
    const prompt = `Contenu d'une page gouvernementale officielle (pays: ${context.country}, thème: ${context.category}):\n"""${text}"""\n\nExtrais les informations pratiques essentielles qu'un expatrié doit connaître. Couvre, SEULEMENT si présent dans le texte: les démarches/étapes obligatoires, le coût (gratuit ou montant précis), les documents requis, les délais, les conditions d'éligibilité, et l'organisme compétent. RÈGLES STRICTES: utilise UNIQUEMENT des informations présentes dans le texte ci-dessus; n'invente RIEN; si une info n'est pas dans le texte, ne la mets pas; chaque fait = une phrase courte, concrète et autonome en français; donne 3 à 7 faits, les plus utiles d'abord. Réponds en JSON STRICT {"points": ["...", "..."]}.`;
    try {
      const { data } = await axios.post<{
        choices: Array<{ message: { content: string } }>;
      }>(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          response_format: { type: 'json_object' },
        },
        { timeout: 30000, headers: { Authorization: `Bearer ${this.apiKey}` } },
      );
      const parsed = JSON.parse(data.choices[0].message.content) as {
        points?: unknown;
      };
      return Array.isArray(parsed.points)
        ? parsed.points
            .map((p) => String(p))
            .filter((p) => p.trim())
            .slice(0, 7)
        : [];
    } catch {
      return [];
    }
  }

  async pickBest(
    query: string,
    candidates: SearchCandidate[],
  ): Promise<RankResult | null> {
    if (candidates.length === 0) return null;
    const list = candidates
      .map(
        (c, i) =>
          `${i}: ${c.title} — ${c.url}\n   excerpt: ${(c.snippet ?? '').slice(0, 200)}`,
      )
      .join('\n');
    const prompt = `Query: "${query}".\nCandidates (official, already verified):\n${list}\n\nReturn STRICT JSON {"index": <number from the list>, "label": "<short human label>", "confidence": <0..1>}. The index MUST be one of the listed numbers. Do not invent URLs.`;
    try {
      const { data } = await axios.post<{
        choices: Array<{ message: { content: string } }>;
      }>(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          response_format: { type: 'json_object' },
        },
        { timeout: 30000, headers: { Authorization: `Bearer ${this.apiKey}` } },
      );
      const raw = JSON.parse(data.choices[0].message.content) as RankResult;
      return clampRankResult(raw, candidates);
    } catch {
      return null;
    }
  }
}
