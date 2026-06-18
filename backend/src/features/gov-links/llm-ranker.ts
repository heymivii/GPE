import axios from 'axios';
import { SearchCandidate, RankResult } from './gov-links.types';

export interface SummarizeResult {
  facts: string[];
  actions: string[];
}

export interface LlmRanker {
  pickBest(
    query: string,
    candidates: SearchCandidate[],
  ): Promise<RankResult | null>;
  summarize(
    pageText: string,
    context: { country: string; category: string },
  ): Promise<SummarizeResult>;
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
  ): Promise<SummarizeResult> {
    const empty: SummarizeResult = { facts: [], actions: [] };
    const text = (pageText ?? '').slice(0, 4000);
    if (!text.trim()) return empty;
    const prompt = `Tu es un assistant de traitement de texte. Voici le contenu brut d'une page gouvernementale officielle (pays: ${context.country}, thème: ${context.category}) :
"""
${text}
"""

RÈGLES ABSOLUES — à respecter sans exception :
1. Utilise EXCLUSIVEMENT les informations présentes dans le texte de la page ci-dessus.
2. N'utilise AUCUNE connaissance externe. N'invente RIEN.
3. Si une démarche ou une information n'est pas explicitement décrite sur cette page, ne la mentionne pas — il vaut mieux renvoyer MOINS d'éléments (voire des listes vides) que des éléments inventés ou supposés.
4. Ne déduis pas d'étapes « classiques » de mémoire (ex : ne mentionne PAS l'AME, la CMU, ni aucun dispositif non cité dans le texte).
5. La réponse doit être en FRANÇAIS, même si le texte source est en anglais.

Retourne STRICTEMENT le JSON suivant, sans texte avant ni après :
{"facts": ["..."], "actions": ["..."]}

- "facts" : 0 à 5 phrases DESCRIPTIVES courtes qu'un expatrié doit SAVOIR d'après ce texte (coût, délais, conditions d'éligibilité, organisme compétent). Si rien de précis n'est dans le texte, renvoie [].
- "actions" : 0 à 7 TÂCHES CONCRÈTES à l'IMPÉRATIF tirées du texte (ex : "Préparer un passeport valide ≥ 6 mois", "Remplir le formulaire de demande", "Prendre rendez-vous au consulat"). Chaque action = phrase impérative courte, ancrée dans le contenu de la page. Si rien de précis n'est dans le texte, renvoie [].`;
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
        facts?: unknown;
        actions?: unknown;
      };
      const facts = Array.isArray(parsed.facts)
        ? parsed.facts
            .map((p) => String(p))
            .filter((p) => p.trim())
            .slice(0, 5)
        : [];
      const actions = Array.isArray(parsed.actions)
        ? parsed.actions
            .map((p) => String(p))
            .filter((p) => p.trim())
            .slice(0, 7)
        : [];
      return { facts, actions };
    } catch {
      return empty;
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
