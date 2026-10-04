import type { UUID } from '../types/common.js';
import type { RecruitingScore } from '../types/models.js';
import type {
  IRecruitingScoreRepository, IPlayerRepository, ISchoolRepository,
} from '../repositories/interfaces.js';
import type { IScoreProvider } from './scoring.js';
import type { EventBus } from '../events/EventBus.js';
import { NotFoundError, ForbiddenError } from '../errors/index.js';
import type { AuthContext } from '../auth/index.js';
import { Policy } from '../auth/index.js';

/**
 * Orchestrates recruiting scores. It owns persistence + authorization + events;
 * the actual math lives in the external engine behind IScoreProvider. Reading
 * stored scores works today; computing new ones works the moment a real
 * provider is injected — no refactor.
 */
export class RecruitingService {
  constructor(
    private readonly scores: IRecruitingScoreRepository,
    private readonly players: IPlayerRepository,
    private readonly schools: ISchoolRepository,
    private readonly provider: IScoreProvider,
    private readonly events: EventBus,
  ) {}

  async listForPlayer(playerId: UUID, actor: AuthContext): Promise<RecruitingScore[]> {
    if (!Policy.ownsPlayer(actor, playerId)) throw new ForbiddenError('Not permitted');
    return this.scores.listByPlayer(playerId, true);
  }

  async getOne(playerId: UUID, schoolId: UUID, actor: AuthContext): Promise<RecruitingScore> {
    if (!Policy.ownsPlayer(actor, playerId)) throw new ForbiddenError('Not permitted');
    const score = await this.scores.findLatest(playerId, schoolId);
    if (!score) throw new NotFoundError('RecruitingScore', `${playerId}/${schoolId}`);
    return score;
  }

  /**
   * Compute (via the injected provider) and persist the latest score. Until the
   * engine is wired, the PendingScoreProvider surfaces a clear 502.
   */
  async computeAndStore(playerId: UUID, schoolId: UUID, actor: AuthContext): Promise<RecruitingScore> {
    if (!Policy.ownsPlayer(actor, playerId)) throw new ForbiddenError('Not permitted');

    const player = await this.players.findById(playerId);
    if (!player) throw new NotFoundError('Player', playerId);
    const school = await this.schools.findById(schoolId);
    if (!school) throw new NotFoundError('School', schoolId);

    const result = await this.provider.score(playerId, schoolId);
    const stored = await this.scores.upsertLatest({ playerId, schoolId, ...result });

    await this.events.emit('RecruitingScoreCalculated', {
      playerId,
      schoolId,
      overall: stored.overall,
    });
    return stored;
  }
}
