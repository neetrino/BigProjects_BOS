import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

const SAFE_HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEFAULT_WEB_URL = 'http://localhost:3000';
const CSRF_REJECTION_MESSAGE = 'Cross-origin request rejected.';

/**
 * Defense-in-depth CSRF protection for cookie-authenticated mutations.
 *
 * The session cookie is `SameSite=Lax`, which already stops browsers from attaching it to
 * cross-site POST/PUT/PATCH/DELETE requests initiated by other sites. This guard adds a second,
 * independent check on top: for every mutating request it validates the `Origin` header
 * (falling back to `Referer` if `Origin` is absent) and only allows the configured web app
 * origin (`WEB_URL`) or the API's own origin.
 *
 * In production the Next.js frontend proxies `/api/*` requests through server-side rewrites, so
 * genuine browser requests are same-origin with the API and this check passes transparently.
 * A request with no `Origin`/`Referer` at all, or one that mismatches, is rejected.
 */
@Injectable()
export class CsrfOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_HTTP_METHODS.has(request.method)) {
      return true;
    }

    const requestOrigin = this.resolveRequestOrigin(request);
    const allowedOrigins = this.resolveAllowedOrigins(request);

    if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
      throw new ForbiddenException(CSRF_REJECTION_MESSAGE);
    }

    return true;
  }

  private resolveRequestOrigin(request: Request): string | null {
    const originHeader = request.headers.origin;
    if (typeof originHeader === 'string' && originHeader.length > 0) {
      return originHeader;
    }

    const refererHeader = request.headers.referer;
    if (typeof refererHeader === 'string' && refererHeader.length > 0) {
      try {
        return new URL(refererHeader).origin;
      } catch {
        return null;
      }
    }

    return null;
  }

  private resolveAllowedOrigins(request: Request): string[] {
    const webUrl = process.env.WEB_URL ?? DEFAULT_WEB_URL;
    const apiOwnOrigin = `${request.protocol}://${request.get('host') ?? ''}`;
    return [webUrl, apiOwnOrigin];
  }
}
