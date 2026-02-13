import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ContentFilterService {
  private readonly logger = new Logger(ContentFilterService.name);
  private readonly openai: OpenAI | null;

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
    /\b(kill|murder|slaughter|massacre|exterminate|destroy)\s+(everyone|everybody|them\s+all|all|people|you)\b/i,
    /\b(i\s+will|i'?m\s+gonna?|going\s+to)\s+(kill|murder|shoot|stab|bomb|attack)\b/i,
    /\b(je\s+vais|on\s+va)\s+(tuer|massacrer|égorger|buter|crever|exploser|frapper)\b/i,
    /\b(die|mort|mourir|crever)\s+(tous|all)\b/i,
    /\bburn\s+(everything|it\s+all|them|you)\s+down\b/i,
    /\bshoot\s+(up|everyone|them)\b/i,
    /\bstupid\s+(people|race|n[i1]g|black|white|arab|jew)\b/i,
    /\b(rape|viol[eé]r)\b/i,
    /\bsuicid/i,
    /\b(fils\s+de\s+pute|suce\s+ma)\b/i,
    /\b(merde|bordel|salope|sal[o0]p|pétasse|pet+asse|con+asse|conasse|batard|bâtard|b[aâ]t[aâ]r)\b/i,
    /\b(fuck\s*you|fuck\s*off|motherfuck|stfu|asshole|a+ss+hole|bitch|b[i1]tch|shit|sh[i1]t)\b/i,
    /\b(con+ard|conard)\b/i,
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
      this.logger.warn('⚠️ OPENAI_API_KEY not set — using local blocklist fallback only');
    }
  }

  async validate(content: string): Promise<{ ok: boolean; reason?: string }> {
    if (!content || content.trim().length === 0) {
      return { ok: false, reason: 'Content is empty' };
    }

    const localCheck = this.validateLocal(content);
    if (!localCheck.ok) return localCheck;

    if (this.openai) {
      try {
        const moderation = await this.openai.moderations.create({
          model: 'omni-moderation-latest',
          input: content,
        });

        const result = moderation.results[0];

        if (result.flagged) {
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
          return { ok: false, reason: `Content flagged for: ${labels.join(', ')}` };
        }

        return { ok: true };
      } catch (error) {
        this.logger.error(`OpenAI Moderation API error, falling back to local filter: ${error}`);
      }
    }

    return { ok: true };
  }

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

  sanitize(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*on\w+\s*=/gi, '<')
      .replace(/javascript:/gi, '')
      .trim();
  }
}
