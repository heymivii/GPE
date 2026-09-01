import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ContentFilterService } from './content-filter.service';

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    moderations: { create: jest.fn() },
  })),
}));

describe('ContentFilterService', () => {
  let service: ContentFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentFilterService,
        {
          provide: ConfigService,
          useValue: {
            // No API key → local-only mode
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ContentFilterService>(ContentFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── sanitize() ────────────────────────────────────────────────

  describe('sanitize()', () => {
    it('should strip <script> tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      expect(service.sanitize(input)).toBe('Hello  World');
    });

    it('should strip inline event handlers', () => {
      const input = '<img onerror=alert(1) src="x">';
      expect(service.sanitize(input)).not.toContain('onerror');
    });

    it('should strip javascript: URIs', () => {
      const input = '<a href="javascript:void(0)">click</a>';
      expect(service.sanitize(input)).not.toContain('javascript:');
    });

    it('should trim whitespace', () => {
      expect(service.sanitize('  Hello  ')).toBe('Hello');
    });

    it('should return clean text unchanged', () => {
      const input = 'This is a normal message about expatriation.';
      expect(service.sanitize(input)).toBe(input);
    });
  });

  // ─── validate() — local blocklist fallback ─────────────────────

  describe('validate() — local fallback', () => {
    it('should reject empty content', async () => {
      const result = await service.validate('');
      expect(result.ok).toBe(false);
      expect(result.reason).toContain('empty');
    });

    it('should reject whitespace-only content', async () => {
      const result = await service.validate('   ');
      expect(result.ok).toBe(false);
    });

    it('should accept clean text', async () => {
      const result = await service.validate(
        'Bonjour, je cherche des infos sur le visa Canada.',
      );
      expect(result.ok).toBe(true);
    });

    it('should accept normal English text', async () => {
      const result = await service.validate(
        'What are the best cities for expats in Europe?',
      );
      expect(result.ok).toBe(true);
    });

    // Profanity blocklist
    it('should reject profanity (FR)', async () => {
      const result = await service.validate('Tu es un bougnoule');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('profanity');
    });

    it('should reject profanity (EN)', async () => {
      const result = await service.validate('You are a faggot');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('profanity');
    });

    it('should reject hate speech patterns', async () => {
      const result = await service.validate('sale arabe dégage');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('profanity');
    });

    // Spam patterns
    it('should reject spam content', async () => {
      const result = await service.validate(
        'Buy now! Limited offer! Act fast! Click here!',
      );
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('spam');
    });

    it('should reject crypto spam', async () => {
      const result = await service.validate('bitcoin free giveaway to all!');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('spam');
    });

    it('should reject repeated characters (spam)', async () => {
      const result = await service.validate('aaaaaaaaaaaa');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('spam');
    });

    // All-caps detection
    it('should reject all-caps messages', async () => {
      const result = await service.validate(
        'JE SUIS VRAIMENT TRES EN COLERE CONTRE TOUT LE MONDE ICI',
      );
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('all_caps');
    });

    it('should accept mostly lowercase with some caps', async () => {
      const result = await service.validate(
        'Je suis content de partager mon EXPÉRIENCE',
      );
      expect(result.ok).toBe(true);
    });

    it('should accept short uppercase words', async () => {
      const result = await service.validate('OK merci !');
      expect(result.ok).toBe(true);
    });
  });

  // ─── validate() — with OpenAI mock ────────────────────────────

  describe('validate() — OpenAI integration', () => {
    let serviceWithApi: ContentFilterService;
    let moderationsCreate: jest.Mock;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ContentFilterService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('sk-test-fake-key'),
            },
          },
        ],
      }).compile();

      serviceWithApi = module.get<ContentFilterService>(ContentFilterService);
      moderationsCreate = (serviceWithApi as any).openai.moderations.create;
    });

    it('does not build an OpenAI client when the key is the placeholder value', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ContentFilterService,
          {
            provide: ConfigService,
            useValue: { get: jest.fn().mockReturnValue('your_openai_api_key') },
          },
        ],
      }).compile();
      const svc = module.get<ContentFilterService>(ContentFilterService);
      expect((svc as any).openai).toBeNull();
    });

    it('rejects content flagged by the OpenAI moderation API, mapping categories to labels', async () => {
      moderationsCreate.mockResolvedValue({
        results: [
          {
            flagged: true,
            categories: { hate: true, violence: false, harassment: true },
          },
        ],
      });

      const result = await serviceWithApi.validate('some content');

      expect(result.ok).toBe(false);
      expect(result.reason).toBe(
        'Content flagged for: harassment, hate speech',
      );
    });

    it('accepts content the OpenAI moderation API does not flag', async () => {
      moderationsCreate.mockResolvedValue({
        results: [{ flagged: false, categories: {} }],
      });

      const result = await serviceWithApi.validate('clean content');

      expect(result.ok).toBe(true);
    });

    it('falls back to the local filter when the OpenAI call throws', async () => {
      moderationsCreate.mockRejectedValue(new Error('network down'));

      const result = await serviceWithApi.validate(
        'Bonjour, comment obtenir un visa pour le Canada ?',
      );

      expect(result.ok).toBe(true);
    });

    it('still catches profanity locally before ever calling OpenAI', async () => {
      const result = await serviceWithApi.validate('Tu es un bougnoule');
      expect(result.ok).toBe(false);
      expect(moderationsCreate).not.toHaveBeenCalled();
    });
  });
});
