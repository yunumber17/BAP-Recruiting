import { randomUUID } from 'node:crypto';
import type { School } from '../src/types/models.js';
import type { AuthContext } from '../src/auth/index.js';

export function makeSchool(over: Partial<School> = {}): School {
  return {
    id: randomUUID(),
    extId: null,
    name: 'Test University',
    city: 'Testville',
    state: 'CA',
    region: 'WEST',
    division: 'D1',
    conference: 'Test Conf',
    type: 'Public',
    enrollment: null,
    tuition: null,
    scholarshipAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

export function playerAuth(playerId: string, userId = playerId): AuthContext {
  return { userId, role: 'PLAYER', playerId };
}

export function adminAuth(): AuthContext {
  return { userId: randomUUID(), role: 'ADMIN' };
}
