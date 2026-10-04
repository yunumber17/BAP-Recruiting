import type { Request, Response, NextFunction } from 'express';
import type { TokenVerifier, Role } from '../auth/index.js';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';
import type { AppRequest } from '../api/http.js';

/**
 * Verifies the Bearer token via the injected TokenVerifier and attaches the
 * AuthContext. `roles` optionally restricts the endpoint. Auth remains an
 * interface — any provider that implements TokenVerifier plugs in here.
 */
export function authGuard(verifier: TokenVerifier, roles?: readonly Role[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing bearer token');
      }
      const auth = await verifier.verify(header.slice('Bearer '.length));
      if (roles && !roles.includes(auth.role)) {
        throw new ForbiddenError(`Requires role: ${roles.join(' | ')}`);
      }
      (req as AppRequest).context.auth = auth;
      next();
    } catch (err) {
      next(err);
    }
  };
}
