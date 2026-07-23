import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';
const HEALTH_PATH_PREFIX = '/api/v1/health';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const requestId =
      typeof incoming === 'string' && incoming.trim().length > 0 ? incoming.trim() : randomUUID();

    res.setHeader(REQUEST_ID_HEADER, requestId);
    const startedAtMs = Date.now();

    res.on('finish', () => {
      const durationMs = Date.now() - startedAtMs;
      const url = req.originalUrl || req.url;
      const message = `${req.method} ${url} ${res.statusCode} ${durationMs}ms rid=${requestId}`;

      if (url.startsWith(HEALTH_PATH_PREFIX)) {
        this.logger.debug(message);
        return;
      }

      this.logger.log(message);
    });

    next();
  }
}
