/**
 * Conversation memory. Short-term = recent turns; long-term = durable
 * preferences/goals + a rolling summary. Interfaces here; in-memory impls below.
 * A DB-backed impl (backend services) plugs in later with no advisor change.
 */
import type { UUID } from '../models/common.js';
import type { ChatMessage } from '../providers/types.js';

export interface ShortTermMemory {
  append(sessionId: string, message: ChatMessage): Promise<void>;
  recent(sessionId: string, limit?: number): Promise<ChatMessage[]>;
  clear(sessionId: string): Promise<void>;
}

export interface PlayerMemory {
  preferences: Record<string, string>;
  goals: string[];
  summary: string;
}

export interface LongTermMemory {
  get(playerId: UUID): Promise<PlayerMemory>;
  setPreference(playerId: UUID, key: string, value: string): Promise<void>;
  addGoal(playerId: UUID, goal: string): Promise<void>;
  updateSummary(playerId: UUID, summary: string): Promise<void>;
}

export class InMemoryShortTermMemory implements ShortTermMemory {
  private readonly bySession = new Map<string, ChatMessage[]>();
  constructor(private readonly maxTurns = 20) {}

  async append(sessionId: string, message: ChatMessage): Promise<void> {
    const list = this.bySession.get(sessionId) ?? [];
    list.push(message);
    if (list.length > this.maxTurns) list.splice(0, list.length - this.maxTurns);
    this.bySession.set(sessionId, list);
  }
  async recent(sessionId: string, limit = this.maxTurns): Promise<ChatMessage[]> {
    const list = this.bySession.get(sessionId) ?? [];
    return list.slice(-limit);
  }
  async clear(sessionId: string): Promise<void> {
    this.bySession.delete(sessionId);
  }
}

export class InMemoryLongTermMemory implements LongTermMemory {
  private readonly byPlayer = new Map<UUID, PlayerMemory>();

  private ensure(playerId: UUID): PlayerMemory {
    let m = this.byPlayer.get(playerId);
    if (!m) {
      m = { preferences: {}, goals: [], summary: '' };
      this.byPlayer.set(playerId, m);
    }
    return m;
  }
  async get(playerId: UUID): Promise<PlayerMemory> {
    return structuredCloneSafe(this.ensure(playerId));
  }
  async setPreference(playerId: UUID, key: string, value: string): Promise<void> {
    this.ensure(playerId).preferences[key] = value;
  }
  async addGoal(playerId: UUID, goal: string): Promise<void> {
    const m = this.ensure(playerId);
    if (!m.goals.includes(goal)) m.goals.push(goal);
  }
  async updateSummary(playerId: UUID, summary: string): Promise<void> {
    this.ensure(playerId).summary = summary;
  }
}

function structuredCloneSafe(m: PlayerMemory): PlayerMemory {
  return { preferences: { ...m.preferences }, goals: [...m.goals], summary: m.summary };
}
