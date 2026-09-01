import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard;

  beforeEach(() => {
    guard = new OptionalJwtAuthGuard();
  });

  it('returns the user when authentication succeeds', () => {
    const user = { userId: 1 };
    expect(guard.handleRequest(null, user)).toEqual(user);
  });

  it('returns the falsy user as-is instead of throwing when there is no valid token', () => {
    expect(guard.handleRequest(null, false)).toBe(false);
  });

  it('returns null when passport resolves no user at all', () => {
    expect(guard.handleRequest(null, undefined)).toBeNull();
  });

  it('does not throw when passport reports an error, still resolving the (falsy) user', () => {
    expect(guard.handleRequest(new Error('invalid token'), false)).toBe(false);
  });
});
