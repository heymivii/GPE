import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Content moderation service using the OpenAI Moderation API (free).
 * Falls back to a local blocklist if the API is unavailable or no API key is configured.
 *
 * @see https://platform.openai.com/docs/guides/moderation
 */
@Injectable()
export class ContentFilterService {
  private readonly logger = new Logger(ContentFilterService.name);
  private readonly openai: OpenAI | null;

  // Categories we want to reject (OpenAI returns these in the response)
  private readonly rejectedCategories: string[] = [
    'harassment',
    'harassment/threatening',
    'hate',
    'hate/threatening',
    'self-harm',
    'self-harm/intent',
    'self-harm/instructions',
    'sexual',
    'sexual/minors',
    'violence',
    'violence/graphic',
    'illicit',
    'illicit/violent',
  ];

  // Friendly labels for each category (used in rejection reasons)
  private readonly categoryLabels: Record<string, string> = {
    harassment: 'harassment',
    'harassment/threatening': 'threatening harassment',
    hate: 'hate speech',
    'hate/threatening': 'threatening hate speech',
    'self-harm': 'self-harm',
    'self-harm/intent': 'self-harm intent',
    'self-harm/instructions': 'self-harm instructions',
    sexual: 'sexual content',
    'sexual/minors': 'sexual content involving minors',
    violence: 'violence',
    'violence/graphic': 'graphic violence',
    illicit: 'illicit content',
    'illicit/violent': 'illicit violent content',
  };

  // ─── Local fallback blocklist ──────────────────────────────────────
  private readonly blocklist: RegExp[] = [
    /\bn[i1]gg[ae3]r?\b/i,
    /\bfagg?[o0]t\b/i,
    /\bk[i1]ke\b/i,
    /\bsp[i1]c\b/i,
    /\bch[i1]nk\b/i,
    /\bcunt\b/i,
    /\bbougnoule\b/i,
    /\bnègre\b/i,
    /\bpédé\b/i,
    /\btapette\b/i,
    /\bsale\s+(arabe|juif|noir|blanc|chinois)\b/i,
    /\b(je vais te|i'?ll)\s+(tu|kill|murder)\b/i,
    /\bcrève\b/i,
    /\benculé\b/i,
    /\bconnard\b/i,
    /\bputain\b/i,
    /\bfdp\b/i,
    /\bntm\b/i,
  ];

  private readonly spamPatterns: RegExp[] = [
    /(.)\1{7,}/i,
    /(https?:\/\/[^\s]+\s*){4,}/i,
    /\b(buy\s+now|limited\s+offer|act\s+fast|click\s+here|free\s+money|earn\s+\$?\d+)\b/i,
    /\b(crypto|bitcoin|nft|airdrop)\s+(free|giveaway|opportunity)\b/i,
    /\b(whatsapp|telegram)\s*:?\s*\+?\d{8,}/i,
  ];

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.logger.log(`🔑 OPENAI_API_KEY present: ${!!apiKey}`);
    if (apiKey && apiKey !== 'your_openai_api_key') {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('✅ OpenAI Moderation API enabled');
    } else {
      this.openai = null;
      this.logger.warn(
        '⚠️ OPENAI_API_KEY not set — using local blocklist fallback only',
      );
    }
  }

  /**
   * Validate content using OpenAI Moderation API, with local fallback.
   * Returns { ok: true } or { ok: false, reason: string }
   */
  async validate(
    content: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    if (!content || content.trim().length === 0) {
      return { ok: false, reason: 'Content is empty' };
    }

    // 1) Try OpenAI Moderation API
    if (this.openai) {
      try {
        const moderation = await this.openai.moderations.create({
          model: 'omni-moderation-latest',
          input: content,
        });

        const result = moderation.results[0];

        if (result.flagged) {
          // Find which categories were flagged
          const flaggedCategories = this.rejectedCategories.filter(
            (cat) =>
              (result.categories as unknown as Record<string, boolean>)[cat],
          );

          const labels = flaggedCategories.map(
            (cat) => this.categoryLabels[cat] || cat,
          );

          this.logger.warn(
            `🚫 OpenAI flagged content: [${labels.join(', ')}] — "${content.slice(0, 80)}..."`,
          );

          return {
            ok: false,
            reason: `Content flagged for: ${labels.join(', ')}`,
          };
        }

        // OpenAI says it's OK — pass
        return { ok: true };
      } catch (error) {
        this.logger.error(
          `OpenAI Moderation API error, falling back to local filter: ${error}`,
        );
        // Fall through to local filter
      }
    }

    // 2) Local fallback: blocklist + spam patterns
    return this.validateLocal(content);
  }

  /**
   * Local-only validation (blocklist + spam + all-caps detection).
   */
  private validateLocal(content: string): { ok: boolean; reason?: string } {
    for (const pattern of this.blocklist) {
      if (pattern.test(content)) {
        this.logger.warn(
          `🚫 Local filter blocked (profanity): "${content.slice(0, 50)}..."`,
        );
        return { ok: false, reason: 'profanity' };
      }
    }

    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        this.logger.warn(
          `🚫 Local filter blocked (spam): "${content.slice(0, 50)}..."`,
        );
        return { ok: false, reason: 'spam' };
      }
    }

    if (content.length > 20) {
      const letters = content.replace(/[^a-zA-ZÀ-ÿ]/g, '');
      if (letters.length > 10) {
        const uppercaseRatio =
          letters.replace(/[^A-ZÀ-Ý]/g, '').length / letters.length;
        if (uppercaseRatio > 0.8) {
          this.logger.warn(
            `🚫 Local filter blocked (all caps): "${content.slice(0, 50)}..."`,
          );
          return { ok: false, reason: 'all_caps' };
        }
      }
    }

    return { ok: true };
  }

  /**
   * Sanitize content — strip dangerous HTML / XSS.
   */
  sanitize(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*on\w+\s*=/gi, '<')
      .replace(/javascript:/gi, '')
      .trim();
  }
}
