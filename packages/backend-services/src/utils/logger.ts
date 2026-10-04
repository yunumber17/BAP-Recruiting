import pino, { type Logger } from 'pino';
import { loadConfig } from '../config/env.js';

export type { Logger };

const cfg = loadConfig();

/** Root logger. Request-scoped children are created by the context middleware. */
export const logger: Logger = pino({
  level: cfg.LOG_LEVEL,
  base: { service: 'backend-services' },
  redact: ['req.headers.authorization', 'password', 'token'],
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function childLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}
