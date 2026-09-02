import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const makeConfigService = (secret: string | undefined) =>
    ({ get: jest.fn().mockReturnValue(secret) }) as unknown as ConfigService;

  it('throws at construction when JWT_SECRET is not configured', () => {
    expect(() => new JwtStrategy(makeConfigService(undefined))).toThrow(
      'JWT_SECRET env variable is required',
    );
  });

  it('constructs successfully when JWT_SECRET is configured', () => {
    expect(() => new JwtStrategy(makeConfigService('secret'))).not.toThrow();
  });

  describe('validate', () => {
    let strategy: JwtStrategy;

    beforeEach(() => {
      strategy = new JwtStrategy(makeConfigService('secret'));
    });

    it('rejects a payload with no sub claim', async () => {
      await expect(strategy.validate({ email: 'a@b.com' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a null payload', async () => {
      await expect(strategy.validate(null)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('maps a valid payload to the request user shape', async () => {
      const result = await strategy.validate({
        sub: 42,
        email: 'a@b.com',
        role: 'admin',
      });
      expect(result).toEqual({
        userId: 42,
        email: 'a@b.com',
        role: 'admin',
      });
    });
  });

  describe('jwtFromRequest extractor', () => {
    let strategy: JwtStrategy;
    let extractor: (req: any) => string | null;

    beforeEach(() => {
      strategy = new JwtStrategy(makeConfigService('secret'));
      // passport-jwt's Strategy stores the configured extractor as _jwtFromRequest.
      extractor = (strategy as any)._jwtFromRequest;
    });

    it('reads the token from the access_token cookie when present', () => {
      const req = { cookies: { access_token: 'from-cookie' } };
      expect(extractor(req)).toBe('from-cookie');
    });

    it('falls back to the Authorization bearer header when no cookie is set', () => {
      const req = {
        cookies: {},
        headers: { authorization: 'Bearer from-header' },
      };
      expect(extractor(req)).toBe('from-header');
    });

    it('falls back to the bearer header when the request has no cookies at all', () => {
      const req = { headers: { authorization: 'Bearer from-header' } };
      expect(extractor(req)).toBe('from-header');
    });

    it('returns null when neither a cookie nor a bearer header is present', () => {
      const req = { cookies: {}, headers: {} };
      expect(extractor(req)).toBeNull();
    });
  });
});
