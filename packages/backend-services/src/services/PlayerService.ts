import type { UUID } from '../types/common.js';
import type { Player } from '../types/models.js';
import type {
  IPlayerRepository, PlayerCreateInput, PlayerUpdateInput, IActivityLogRepository,
} from '../repositories/interfaces.js';
import type { EventBus } from '../events/EventBus.js';
import type { CacheStore } from '../cache/CacheStore.js';
import { cacheKey } from '../cache/CacheStore.js';
import { NotFoundError, ConflictError } from '../errors/index.js';
import type { AuthContext } from '../auth/index.js';
import { Policy } from '../auth/index.js';
import { ForbiddenError } from '../errors/index.js';

/** Business logic for players. Constructor-injected dependencies only. */
export class PlayerService {
  private readonly ttl = 60;

  constructor(
    private readonly players: IPlayerRepository,
    private readonly events: EventBus,
    private readonly cache: CacheStore,
    private readonly activity: IActivityLogRepository,
  ) {}

  async getById(id: UUID): Promise<Player> {
    const key = cacheKey('player', id);
    const cached = await this.cache.get<Player>(key);
    if (cached) return cached;

    const player = await this.players.findById(id);
    if (!player) throw new NotFoundError('Player', id);
    await this.cache.set(key, player, this.ttl);
    return player;
  }

  async create(input: PlayerCreateInput): Promise<Player> {
    const existing = await this.players.findByUserId(input.userId);
    if (existing) throw new ConflictError('A player already exists for this user');

    const player = await this.players.create(input);
    await this.activity.record({
      actorUserId: input.userId,
      action: 'CREATE',
      entityType: 'Player',
      entityId: player.id,
      after: player,
    });
    await this.events.emit('PlayerCreated', { playerId: player.id, userId: player.userId });
    return player;
  }

  async update(id: UUID, input: PlayerUpdateInput, actor: AuthContext): Promise<Player> {
    if (!Policy.ownsPlayer(actor, id)) throw new ForbiddenError('Cannot modify another player');
    const before = await this.players.findById(id);
    if (!before) throw new NotFoundError('Player', id);

    const player = await this.players.update(id, input);
    await this.cache.delete(cacheKey('player', id));
    await this.activity.record({
      actorUserId: actor.userId,
      action: 'UPDATE',
      entityType: 'Player',
      entityId: id,
      before,
      after: player,
    });
    await this.events.emit('PlayerUpdated', { playerId: id });
    return player;
  }

  async remove(id: UUID, actor: AuthContext): Promise<void> {
    if (!Policy.ownsPlayer(actor, id)) throw new ForbiddenError('Cannot delete another player');
    const existing = await this.players.findById(id);
    if (!existing) throw new NotFoundError('Player', id);
    await this.players.softDelete(id);
    await this.cache.delete(cacheKey('player', id));
    await this.activity.record({
      actorUserId: actor.userId,
      action: 'DELETE',
      entityType: 'Player',
      entityId: id,
    });
  }
}
