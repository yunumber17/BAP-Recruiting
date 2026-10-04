/**
 * DEV/TEST ONLY token verifier. Decodes a base64url JSON token of the form
 * { userId, role, playerId?, email? }. Production wires a real TokenVerifier
 * (Auth.js / Supabase JWT / custom) — the interface (auth/index.ts) is the
 * stable contract; nothing else changes.
 */
import type { TokenVerifier, AuthContext, Role } from './index.js';
import { UnauthorizedError } from '../errors/index.js';

const ROLES: readonly Role[] = ['PLAYER', 'PARENT', 'COACH', 'ADMIN'];

export class DevTokenVerifier implements TokenVerifier {
  async verify(token: string): Promise<AuthContext> {
    try {
      const json = Buffer.from(token, 'base64url').toString('utf8');
      const parsed = JSON.parse(json) as Partial<AuthContext>;
      if (!parsed.userId || !parsed.role || !ROLES.includes(parsed.role)) {
        throw new Error('missing userId/role');
      }
      return {
        userId: parsed.userId,
        role: parsed.role,
        playerId: parsed.playerId,
        email: parsed.email,
      };
    } catch {
      throw new UnauthorizedError('Invalid token');
    }
  }
}

/** Helper for tests/clients to mint a dev token. */
export function devToken(ctx: AuthContext): string {
  return Buffer.from(JSON.stringify(ctx), 'utf8').toString('base64url');
}
