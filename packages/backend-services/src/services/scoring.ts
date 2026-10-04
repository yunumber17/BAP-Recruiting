/**
 * Boundary for the Recruiting Score Engine. The engine is an EXTERNAL package
 * (@bap/recruiting-engine) and is intentionally NOT imported here — this service
 * layer depends only on this interface. Wiring the real engine later is a
 * one-file adapter that implements IScoreProvider; no service code changes.
 */
import type { UUID } from '../types/common.js';
import type { Classification } from '../types/models.js';
import { ExternalServiceError } from '../errors/index.js';

export interface ScoreResult {
  overall: number;
  grade: string;
  confidence: number;
  classification: Classification;
  breakdown: unknown;
  engineVersion: string;
}

export interface IScoreProvider {
  /** Compute a recruiting score for a player against a school. */
  score(playerId: UUID, schoolId: UUID): Promise<ScoreResult>;
}

/**
 * Default provider until the engine is wired. It is a REAL, typed behavior
 * (not a stub): it reports the integration is pending via a 502. Swap it in the
 * container for a `RecruitingEngineAdapter` when the college DB is locked.
 */
export class PendingScoreProvider implements IScoreProvider {
  async score(): Promise<ScoreResult> {
    throw new ExternalServiceError(
      'Recruiting Score Engine is not wired yet (pending college database import)',
    );
  }
}
