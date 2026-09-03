import axios from 'axios';
import { Logger } from '@nestjs/common';
import { SearchCandidate, RankResult } from './gov-links.types';
import { selectRelevantExcerpt } from './quality/readable-text';

export interface SummarizeResult {
  facts: string[];
  actions: string[];
  /** Le modèle a jugé la page hors-sujet pour la catégorie demandée (règle 3 du prompt). */
  offTopic?: boolean;
}

export interface LlmRanker {
  pickBest(
    query: string,
    candidates: SearchCandidate[],
  ): Promise<RankResult | null>;
  summarize(
    pageText: string,
    context: { country: string; category: string; keywords?: string[] },
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

/**
 * PROMPT D'EXTRACTION — la pièce maîtresse de la qualité du contenu checklist.
 *
 * L'ancien prompt demandait « des faits et des actions » : le modèle recopiait donc
 * fidèlement n'importe quoi — menus de navigation, étapes de formulaire génériques,
 * contenu d'une autre thématique. Celui-ci donne au modèle un MÉTIER (rédacteur de
 * guides d'expatriation), un LECTEUR (l'expatrié qui ARRIVE), un PÉRIMÈTRE (la seule
 * catégorie demandée) et des CONTRE-EXEMPLES tirés des vraies erreurs observées en
 * base. Exporté pur pour être testable sans LLM.
 */
export function buildSummarizePrompt(
  text: string,
  context: { country: string; category: string },
): string {
  return `Tu es rédacteur professionnel de guides d'expatriation. Tu écris pour une personne étrangère qui S'INSTALLE en ${context.country} et qui suivra tes instructions à la lettre : chaque phrase inexacte ou hors-sujet lui fait perdre du temps ou la met en difficulté administrative.

Voici le texte d'une page gouvernementale officielle (thème de l'étape : « ${context.category} ») :
"""
${text}
"""

TA MISSION : en extraire ce qu'un expatrié doit SAVOIR (facts) et FAIRE (actions) pour l'étape « ${context.category} » — et UNIQUEMENT pour cette étape.

RÈGLES ABSOLUES — à respecter sans exception :
1. Utilise EXCLUSIVEMENT les informations présentes dans le texte ci-dessus. AUCUNE connaissance externe, AUCUNE invention.
2. Si le texte ne décrit pas explicitement une information, ne la mentionne pas. Moins d'éléments — voire des listes vides — vaut toujours mieux que des éléments supposés.
3. PÉRIMÈTRE : ne retiens QUE ce qui concerne « ${context.category} ». Si le texte parle surtout d'un autre sujet (emploi quand le thème est la santé, visa quand le thème est le logement…), renvoie {"facts": [], "actions": [], "off_topic": true}.
4. PORTÉE NATIONALE : ignore tout ce qui n'est valable que pour une ville, un département, un canton ou une préfecture en particulier. Ne recopie JAMAIS une adresse email, un numéro de téléphone ou une adresse postale d'une administration locale.
5. LECTEUR : la personne ARRIVE dans le pays. Ignore les passages destinés aux ressortissants qui partent à l'étranger, aux entreprises ou aux professionnels (sauf si le thème est « business »).
6. Réponds en FRANÇAIS, même si le texte source est dans une autre langue.
7. GÉNÉRALITÉ : la checklist est un guide de PRÉPARATION, pas le mode d'emploi d'un formulaire. Chaque action doit valoir pour TOUTE personne concernée par « ${context.category} », quel que soit son établissement, son organisme ou son cas particulier. Ne recopie pas les alinéas de constitution d'un dossier (« joindre X », « fournir Y », « faire établir Z chez le notaire ») : fusionne-les en UNE action de préparation qui liste les pièces (« Préparer le dossier : pièce d'identité, justificatif de domicile… »). Une action nationale, datée et outillée reste parfaite ; un alinéa de formulaire ne l'est pas.

CE QUE N'EST PAS UNE ACTION — à exclure systématiquement :
- une entrée de menu ou un lien de navigation (« Trouver sa formation », « Préparer son arrivée ») ;
- une étape de formulaire générique, vraie de n'importe quelle démarche (« Renseigner les informations demandées », « Valider votre saisie », « Attendre la réponse », « Joindre les justificatifs ») ;
- une redite d'une autre étape de la checklist (« Ouvrir un compte bancaire » quand le thème est « education »).
Une bonne action nomme son OBJET précis : le document, le formulaire (avec sa référence si elle figure dans le texte), l'organisme, le délai ou le montant. Exemples de bonnes actions : « Valider le VLS-TS en ligne dans les 3 mois suivant l'arrivée », « Demander l'échange du permis de conduire sur le site de l'ANTS ».

Retourne STRICTEMENT ce JSON, sans texte avant ni après :
{"facts": ["..."], "actions": ["..."], "off_topic": false}

- "facts" : 0 à 5 phrases descriptives courtes — coût, délai, condition d'éligibilité, organisme compétent NATIONAL, référence de formulaire. Rien de précis dans le texte → [].
- "actions" : 0 à 7 tâches concrètes à l'impératif, chacune avec son objet précis, dans l'ordre chronologique de la démarche si le texte le donne. Rien de précis → [].
- "off_topic" : true si le texte ne traite pas réellement du thème « ${context.category} » (règle 3), false sinon.`;
}

export class OllamaRanker implements LlmRanker {
  private readonly logger = new Logger(OllamaRanker.name);

  /** Tentatives max par appel LLM (1 initiale + 2 reprises sur 429). */
  private static readonly MAX_LLM_ATTEMPTS = 3;

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

  /**
   * POST /chat/completions avec reprise sur 429.
   *
   * Le palier gratuit Groq plafonne à 8 000 tokens/minute et chaque extraction en
   * consomme ~3 500 : sans reprise, tout appel après le premier de la minute échoue
   * — c'est ce qui a vidé un run entier (« aucune action extraite » sur 10/11
   * catégories). Le serveur annonce l'attente exacte dans `Retry-After` : on la
   * respecte (+1 s de marge) au lieu de deviner.
   */
  private async postChat(prompt: string): Promise<string> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= OllamaRanker.MAX_LLM_ATTEMPTS; attempt++) {
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
          {
            timeout: 30000,
            headers: { Authorization: `Bearer ${this.apiKey}` },
          },
        );
        return data.choices[0].message.content;
      } catch (e) {
        lastError = e;
        const err = e as {
          response?: { status?: number; headers?: Record<string, string> };
        };
        const isLastAttempt = attempt === OllamaRanker.MAX_LLM_ATTEMPTS;
        if (err?.response?.status !== 429 || isLastAttempt) throw e;

        // « 0 » est une valeur valide (fenêtre déjà libérée) — seul un en-tête
        // absent ou illisible retombe sur les 5 s par défaut.
        const retryAfter = Number(err.response?.headers?.['retry-after']);
        const waitMs =
          (Number.isFinite(retryAfter) && retryAfter >= 0 ? retryAfter : 5) *
            1000 +
          1000;
        this.logger.warn(
          `429 rate-limit (${this.model}) — reprise ${attempt}/${OllamaRanker.MAX_LLM_ATTEMPTS - 1} dans ${waitMs / 1000}s`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
    throw lastError;
  }

  async summarize(
    pageText: string,
    context: { country: string; category: string; keywords?: string[] },
  ): Promise<SummarizeResult> {
    const empty: SummarizeResult = { facts: [], actions: [] };
    // La zone la plus dense en vocabulaire de la catégorie — pas les N premiers
    // caractères, qui tombent presque toujours dans le chapeau et la navigation.
    // 6 000 caractères ≈ 1 800 tokens : dimensionné pour que plusieurs appels/minute
    // tiennent dans les 8 000 TPM du palier gratuit Groq, sans sacrifier le contenu.
    const text = selectRelevantExcerpt(
      pageText ?? '',
      context.keywords ?? [],
      6000,
    );
    if (!text.trim()) return empty;
    const prompt = buildSummarizePrompt(text, context);
    try {
      const content = await this.postChat(prompt);
      const parsed = JSON.parse(content) as {
        facts?: unknown;
        actions?: unknown;
        off_topic?: unknown;
      };
      const offTopic = parsed.off_topic === true;
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
      // Page déclarée hors-sujet → on ne publie RIEN de son contenu : des listes même
      // plausibles issues d'une mauvaise page sont exactement le bug qu'on corrige.
      if (offTopic) return { facts: [], actions: [], offTopic: true };
      return { facts, actions, offTopic: false };
    } catch (e) {
      this.logSilencedError('summarize', e);
      return empty;
    }
  }

  /**
   * Les échecs LLM sont volontairement non bloquants (un lien sans résumé vaut mieux
   * qu'un run planté), mais ils doivent être VISIBLES : un modèle décommissionné
   * (404 Groq) s'est fait passer pour « aucune action extraite » pendant tout un run.
   */
  private logSilencedError(op: string, e: unknown): void {
    const err = e as {
      response?: { status?: number; data?: unknown };
      message?: string;
    };
    const status = err?.response?.status;
    const detail = status
      ? `HTTP ${status} ${JSON.stringify(err.response?.data ?? '').slice(0, 200)}`
      : (err?.message ?? 'erreur inconnue');
    this.logger.warn(`${op}() LLM en échec (${this.model}) : ${detail}`);
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
      const content = await this.postChat(prompt);
      const raw = JSON.parse(content) as RankResult;
      return clampRankResult(raw, candidates);
    } catch (e) {
      this.logSilencedError('pickBest', e);
      return null;
    }
  }
}
