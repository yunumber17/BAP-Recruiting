import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { SavedSchoolService } from '../../src/services/SavedSchoolService.js';
import { InMemorySavedSchoolRepository, InMemorySchoolRepository } from '../../src/repositories/inmemory/index.js';
import { InMemoryEventBus } from '../../src/events/EventBus.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../src/errors/index.js';
import { makeSchool, playerAuth } from '../helpers.js';

function build(seedSchool = makeSchool()) {
  const saved = new InMemorySavedSchoolRepository();
  const schools = new InMemorySchoolRepository([seedSchool]);
  const bus = new InMemoryEventBus();
  return { saved, schools, bus, seedSchool, service: new SavedSchoolService(saved, schools, bus) };
}

describe('SavedSchoolService', () => {
  it('saves a school and emits SchoolSaved', async () => {
    const { service, seedSchool, bus } = build();
    const playerId = randomUUID();
    let fired = false;
    bus.on('SchoolSaved', () => { fired = true; });

    const row = await service.save({ playerId, schoolId: seedSchool.id }, playerAuth(playerId));
    expect(row.recruitingStatus).toBe('INTERESTED');
    expect(fired).toBe(true);
  });

  it('rejects saving a nonexistent school', async () => {
    const { service } = build();
    const playerId = randomUUID();
    await expect(
      service.save({ playerId, schoolId: randomUUID() }, playerAuth(playerId)),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects a duplicate save', async () => {
    const { service, seedSchool } = build();
    const playerId = randomUUID();
    await service.save({ playerId, schoolId: seedSchool.id }, playerAuth(playerId));
    await expect(
      service.save({ playerId, schoolId: seedSchool.id }, playerAuth(playerId)),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('forbids acting on behalf of another player', async () => {
    const { service, seedSchool } = build();
    const playerId = randomUUID();
    await expect(
      service.save({ playerId, schoolId: seedSchool.id }, playerAuth(randomUUID())),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('lists favorites first', async () => {
    const { service, schools } = build();
    const a = makeSchool({ name: 'A' });
    const b = makeSchool({ name: 'B' });
    // seed two schools into the repo
    (schools as unknown as { byId: Map<string, unknown> }).byId.set(a.id, a);
    (schools as unknown as { byId: Map<string, unknown> }).byId.set(b.id, b);
    const playerId = randomUUID();
    await service.save({ playerId, schoolId: a.id }, playerAuth(playerId));
    const savedB = await service.save({ playerId, schoolId: b.id, isFavorite: true }, playerAuth(playerId));
    const list = await service.list(playerId, playerAuth(playerId));
    expect(list[0]?.id).toBe(savedB.id);
  });
});
