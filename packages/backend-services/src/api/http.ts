/** Request augmentation shared across middleware + controllers. */
import type { Request } from 'express';
import type { Logger } from '../utils/logger.js';
import type { AuthContext } from '../auth/index.js';

export interface RequestContext {
  requestId: string;
  startedAt: number;
  logger: Logger;
  auth?: AuthContext;
}

export interface AppRequest extends Request {
  context: RequestContext;
}

export function ctx(req: Request): RequestContext {
  return (req as AppRequest).context;
}
