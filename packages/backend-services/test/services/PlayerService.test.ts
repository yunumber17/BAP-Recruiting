import { describe, it, expect, vi } from 'vitest';
import { PlayerService } from '../../src/services/PlayerService.js';
import { InMemoryPlayerRepository, InMemoryActivityLogRepository } from '../../src/repositories/inmemory/index.js';
import { MemoryCache } from '../../src/cache/MemoryCache.js';
import { InMemoryEventBus } from '../../src/events/EventBus.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../src/errors/index.js';
import { playerAuth, adminAuth } from '../helpers.js';
import { randomUUID } from 'node:crypto';

function build() {
  const players = new InMemoryPlayerRepository();
  const activity = new InMemoryActivityLogRepository();
  const bus = new InMemoryEventBus();
  const cache = new MemoryCache();
  const service = new PlayerService(players, bus, cache, activity);
  return { players, activity, bus, cache, service };
}

const base = {
  firstName: 'Taro', lastName: 'Yamada', graduationYear: 2027,
  primaryPosition: 'SHORTSTOP' as const,
};

describe('PlayerService', () => {
  it('creates a player and emits PlayerCreated + logs activity', async () => {
    const { service, bus, activity } = build();
    const emitted: string[] = [];
    bus.on('PlayerCreated', () => { emitted.push('created'); });

    const userId = randomUUID();
    const player = await service.create({ userId, ...base });

    expect(player.id).toBeTruthy();
    expect(player.userId).toBe(userId);
    expect(emitted).toEqual(['created']);
    expect(activity.logs.some((l) => l.action === 'CREATE' && l.entityType === 'Player')).toBe(true);
  });

  it('rejects a duplicate player for the same user', async () => {
    const { service } = build();
    const userId = randomUUID();
    await service.create({ userId, ...base });
    await expect(service.create({ userId, ...base })).rejects.toBeInstanceOf(ConflictError);
  });

  it('getById throws NotFound for unknown id and caches hits', async () => {
    const { service, cache } = build();
    await expect(service.getById(randomUUID())).rejects.toBeInstanceOf(NotFoundError);

    const created = await service.create({ userId: randomUUID(), ...base });
    const spy = vi.spyOn(cache, 'get');
    const first = await service.getById(created.id);
    const second = await service.getById(created.id);
    expect(first.id).toBe(second.id);
    expect(spy).toHaveBeenCalled();
  });

  it('forbids updating another player', async () => {
    const { service } = build();
    const created = await service.create({ userId: randomUUID(), ...base });
    const stranger = playerAuth(randomUUID());
    await expect(service.update(created.id, { firstName: 'X' }, stranger)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows the owner (and admins) to update, and invalidates cache', async () => {
    const { service, cache } = build();
    const created = await service.create({ userId: randomUUID(), ...base });
    await service.getById(created.id); // warm cache
    const del = vi.spyOn(cache, 'delete');

    const owner = playerAuth(created.id, created.userId);
    const updated = await service.update(created.id, { firstName: 'Jiro' }, owner);
    expect(updated.firstName).toBe('Jiro');
    expect(del).toHaveBeenCalled();

    const byAdmin = await service.update(created.id, { lastName: 'Sato' }, adminAuth());
    expect(byAdmin.lastName).toBe('Sato');
  });
});
