import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { childLogger } from '../utils/logger.js';
import type { AppRequest } from '../api/http.js';

/**
 * Attaches a per-request context: a request id (honoring inbound
 * `x-request-id`), a child logger, and start time. Logs one line per request
 * with duration, user id, and status on completion.
 */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
  const startedAt = Date.now();
  const logger = childLogger({ requestId, method: req.method, path: req.path });

  (req as AppRequest).context = { requestId, startedAt, logger };
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const auth = (req as AppRequest).context.auth;
    logger.info(
      { status: res.statusCode, durationMs, userId: auth?.userId ?? null },
      'request completed',
    );
  });

  next();
}
