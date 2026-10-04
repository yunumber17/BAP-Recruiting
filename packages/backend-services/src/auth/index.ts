/**
 * Auth is INTERFACE-ONLY in this package (no login UI, no provider lock-in).
 * A concrete verifier (Auth.js / Supabase / custom JWT) implements
 * TokenVerifier; middleware attaches the resulting AuthContext to the request.
 */
import type { UUID } from '../types/common.js';

export type Role = 'PLAYER' | 'PARENT' | 'COACH' | 'ADMIN';

export interface AuthContext {
  readonly userId: UUID;
  readonly role: Role;
  /** Player the caller acts on behalf of (self, or child for a parent). */
  readonly playerId?: UUID;
  readonly email?: string;
}

/** Verifies a bearer token and returns the auth context, or throws Unauthorized. */
export interface TokenVerifier {
  verify(bearerToken: string): Promise<AuthContext>;
}

/** Authorization policy helpers — pure, testable, no framework coupling. */
export const Policy = {
  isAdmin: (ctx: AuthContext): boolean => ctx.role === 'ADMIN',
  ownsPlayer: (ctx: AuthContext, playerId: UUID): boolean =>
    ctx.role === 'ADMIN' || ctx.playerId === playerId,
  canManageContacts: (ctx: AuthContext): boolean =>
    ctx.role === 'PLAYER' || ctx.role === 'PARENT' || ctx.role === 'ADMIN',
} as const;
