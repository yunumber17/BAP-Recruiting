import type { Request, Response, NextFunction } from 'express';
import { isAppError } from '../errors/index.js';
import { ctx } from '../api/http.js';

/**
 * Centralized error middleware (must be registered last). Maps AppErrors to
 * their status/code; everything else becomes a 500 without leaking internals.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req as { context?: { requestId?: string } }).context?.requestId;
  const log = (() => {
    try {
      return ctx(req).logger;
    } catch {
      return undefined;
    }
  })();

  if (isAppError(err)) {
    if (err.status >= 500) log?.error({ err }, 'app error');
    else log?.warn({ code: err.code }, 'handled error');
    res.status(err.status).json({
      error: err.expose
        ? err.toJSON()
        : { code: err.code, message: 'Internal error' },
      requestId,
    });
    return;
  }

  log?.error({ err }, 'unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal error' },
    requestId,
  });
}

/** 404 for unmatched routes. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
}
