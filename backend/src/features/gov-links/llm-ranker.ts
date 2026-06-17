import axios from 'axios';
import { SearchCandidate, RankResult } from './gov-links.types';

export interface LlmRanker {
  pickBest(
    query: string,
    candidates: SearchCandidate[],
  ): Promise<RankResult | null>;
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
