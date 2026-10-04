import type { UUID } from '../models/common.js';
import type { ContextProviders, ContextSlice, PlayerContext } from './providers.js';
import { ContextError } from '../models/errors.js';
import type { Logger } from '../middleware/logger.js';

/**
 * Assembles a PlayerContext from the data providers, fetching ONLY the slices an
 * advisor requests (parallel). A short-lived cache avoids refetching within a
 * request. Provider errors degrade gracefully (slice omitted + logged), never
 * crash the advisor.
 */
export class ContextBuilder {
  private readonly cache = new Map<string, PlayerContext>();

  constructor(
    private readonly providers: ContextProviders,
    private readonly logger?: Logger,
  ) {}

  async build(playerId: UUID, slices: readonly ContextSlice[]): Promise<PlayerContext> {
    const cacheKey = `${playerId}:${[...slices].sort().join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const ctx: PlayerContext = { playerId };
    await Promise.all(
      slices.map(async (slice) => {
        try {
          await this.fetch(ctx, slice, playerId);
        } catch (err) {
          this.logger?.warn({ err, slice }, 'context slice failed; omitting');
        }
      }),
    );
    this.cache.set(cacheKey, ctx);
    return ctx;
  }

  private async fetch(ctx: PlayerContext, slice: ContextSlice, playerId: UUID): Promise<void> {
    switch (slice) {
      case 'profile': ctx.profile = await this.providers.profile.getProfile(playerId); return;
      case 'metrics': ctx.metrics = await this.providers.metrics.getMetrics(playerId); return;
      case 'scores': ctx.scores = await this.providers.scores.getScores(playerId); return;
      case 'schools': ctx.schools = await this.providers.schools.getSavedSchools(playerId); return;
      case 'timeline': ctx.timeline = await this.providers.timeline.getTimeline(playerId); return;
      case 'tasks': ctx.tasks = await this.providers.tasks.getTasks(playerId); return;
      case 'contacts': ctx.contacts = await this.providers.contacts.getContacts(playerId); return;
      case 'videos': ctx.videos = await this.providers.videos.getVideos(playerId); return;
      default: throw new ContextError(`unknown context slice: ${String(slice)}`);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}
