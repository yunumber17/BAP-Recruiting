import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { RecruitingService } from '../../src/services/RecruitingService.js';
import {
  InMemoryRecruitingScoreRepository, InMemoryPlayerRepository, InMemorySchoolRepository,
} from '../../src/repositories/inmemory/index.js';
import { InMemoryEventBus } from '../../src/events/EventBus.js';
import { PendingScoreProvider, type IScoreProvider } from '../../src/services/scoring.js';
import { ExternalServiceError, NotFoundError } from '../../src/errors/index.js';
import { makeSchool, playerAuth } from '../helpers.js';

describe('RecruitingService', () => {
  it('surfaces ExternalServiceError while the engine is unwired', async () => {
    const school = makeSchool();
    const players = new InMemoryPlayerRepository();
    const player = await players.create({
      userId: randomUUID(), firstName: 'T', lastName: 'Y',
      graduationYear: 2027, primaryPosition: 'SHORTSTOP',
    });
    const svc = new RecruitingService(
      new InMemoryRecruitingScoreRepository(), players,
      new InMemorySchoolRepository([school]), new PendingScoreProvider(), new InMemoryEventBus(),
    );
    await expect(
      svc.computeAndStore(player.id, school.id, playerAuth(player.id, player.userId)),
    ).rejects.toBeInstanceOf(ExternalServiceError);
  });

  it('computes + stores + emits when a real provider is injected (adapter shape)', async () => {
    const school = makeSchool();
    const players = new InMemoryPlayerRepository();
    const player = await players.create({
      userId: randomUUID(), firstName: 'T', lastName: 'Y',
      graduationYear: 2027, primaryPosition: 'SHORTSTOP',
    });
    const scores = new InMemoryRecruitingScoreRepository();
    const bus = new InMemoryEventBus();

    // Fake adapter that mimics the future RecruitingEngineAdapter contract.
    const provider: IScoreProvider = {
      async score() {
        return { overall: 88.2, grade: 'B+', confidence: 94, classification: 'SAFETY', breakdown: {}, engineVersion: '1.0.0' };
      },
    };
    const svc = new RecruitingService(scores, players, new InMemorySchoolRepository([school]), provider, bus);

    let emittedOverall = 0;
    bus.on('RecruitingScoreCalculated', (p) => { emittedOverall = p.overall; });

    const auth = playerAuth(player.id, player.userId);
    const stored = await svc.computeAndStore(player.id, school.id, auth);
    expect(stored.overall).toBe(88.2);
    expect(stored.isLatest).toBe(true);
    expect(emittedOverall).toBe(88.2);

    const list = await svc.listForPlayer(player.id, auth);
    expect(list).toHaveLength(1);
  });

  it('throws NotFound when the school is missing', async () => {
    const players = new InMemoryPlayerRepository();
    const player = await players.create({
      userId: randomUUID(), firstName: 'T', lastName: 'Y',
      graduationYear: 2027, primaryPosition: 'SHORTSTOP',
    });
    const svc = new RecruitingService(
      new InMemoryRecruitingScoreRepository(), players,
      new InMemorySchoolRepository([]), new PendingScoreProvider(), new InMemoryEventBus(),
    );
    await expect(
      svc.computeAndStore(player.id, randomUUID(), playerAuth(player.id, player.userId)),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
