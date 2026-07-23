import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { CsrfOriginGuard } from './csrf-origin.guard';

const WEB_URL = 'http://localhost:3000';

const buildContext = (method: string, headers: Record<string, string>): ExecutionContext => {
  const request = {
    method,
    headers,
    protocol: 'http',
    get: (name: string) => (name.toLowerCase() === 'host' ? 'localhost:4000' : undefined),
  } as unknown as Request;

  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

describe('CsrfOriginGuard', () => {
  const originalWebUrl = process.env.WEB_URL;
  let guard: CsrfOriginGuard;

  beforeEach(() => {
    process.env.WEB_URL = WEB_URL;
    guard = new CsrfOriginGuard();
  });

  afterAll(() => {
    process.env.WEB_URL = originalWebUrl;
  });

  it('allows safe HTTP methods regardless of headers', () => {
    const context = buildContext('GET', {});
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a mutating request whose Origin matches WEB_URL', () => {
    const context = buildContext('POST', { origin: WEB_URL });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a mutating request whose Origin matches the API host itself', () => {
    const context = buildContext('POST', { origin: 'http://localhost:4000' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('falls back to the Referer origin when Origin is absent', () => {
    const context = buildContext('POST', { referer: `${WEB_URL}/login` });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a mutating request with a mismatched Origin', () => {
    const context = buildContext('POST', { origin: 'https://evil.example' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects a mutating request with no Origin or Referer at all', () => {
    const context = buildContext('DELETE', {});
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
