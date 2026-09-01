import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const makeContext = (user: any): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as any;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(makeContext({ role: 'user' }))).toBe(true);
  });

  it('allows access when the required roles list is empty', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    expect(guard.canActivate(makeContext({ role: 'user' }))).toBe(true);
  });

  it('denies access when there is no authenticated user', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(guard.canActivate(makeContext(undefined))).toBe(false);
  });

  it('denies access when the user has no role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(guard.canActivate(makeContext({}))).toBe(false);
  });

  it('denies access when the user role is not in the required list', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(guard.canActivate(makeContext({ role: 'user' }))).toBe(false);
  });

  it('allows access when the user role is in the required list', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'moderator']);
    expect(guard.canActivate(makeContext({ role: 'moderator' }))).toBe(true);
  });
});
