/**
 * In-memory repository implementations. Used for tests and local dev; they
 * satisfy the exact same interfaces as the Prisma repositories, so services and
 * controllers behave identically against either.
 */
import { randomUUID } from 'node:crypto';
import type { Pagination, Paginated, UUID } from '../../types/common.js';
import { paginate } from '../../types/common.js';
import type {
  Player, School, SchoolSearchFilters, PlayerMetric, RecruitingScore, SavedSchool,
  Task, Notification,
} from '../../types/models.js';
import type {
  IPlayerRepository, PlayerCreateInput, PlayerUpdateInput,
  ISchoolRepository, IPlayerMetricRepository, MetricCreateInput,
  ISavedSchoolRepository, SavedSchoolUpsertInput,
  IRecruitingScoreRepository, RecruitingScoreCreateInput,
  ITaskRepository, INotificationRepository, IAnalyticsRepository, IActivityLogRepository,
} from '../interfaces.js';

const now = (): Date => new Date();

export class InMemoryPlayerRepository implements IPlayerRepository {
  private readonly byId = new Map<UUID, Player>();

  async findById(id: UUID): Promise<Player | null> {
    const p = this.byId.get(id);
    return p && !('deletedAt' in p && (p as { deletedAt?: Date }).deletedAt) ? p : null;
  }
  async findByUserId(userId: UUID): Promise<Player | null> {
    return [...this.byId.values()].find((p) => p.userId === userId) ?? null;
  }
  async create(input: PlayerCreateInput): Promise<Player> {
    const p: Player = {
      id: randomUUID(),
      userId: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      graduationYear: input.graduationYear,
      gpa: input.gpa ?? null,
      sat: null,
      act: null,
      primaryPosition: input.primaryPosition,
      secondaryPosition: input.secondaryPosition ?? null,
      heightCm: input.heightCm ?? null,
      weightKg: input.weightKg ?? null,
      throws: input.throws ?? null,
      bats: input.bats ?? null,
      state: input.state ?? null,
      country: input.country ?? 'JP',
      createdAt: now(),
      updatedAt: now(),
    };
    this.byId.set(p.id, p);
    return p;
  }
  async update(id: UUID, input: PlayerUpdateInput): Promise<Player> {
    const existing = this.byId.get(id);
    if (!existing) throw new Error('not found');
    const updated: Player = { ...existing, ...pruneUndefined(input), updatedAt: now() };
    this.byId.set(id, updated);
    return updated;
  }
  async softDelete(id: UUID): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemorySchoolRepository implements ISchoolRepository {
  private readonly byId = new Map<UUID, School>();
  constructor(seed: School[] = []) {
    for (const s of seed) this.byId.set(s.id, s);
  }

  async findById(id: UUID): Promise<School | null> {
    return this.byId.get(id) ?? null;
  }
  async findManyByIds(ids: readonly UUID[]): Promise<School[]> {
    return ids.map((id) => this.byId.get(id)).filter((s): s is School => !!s);
  }
  async search(filters: SchoolSearchFilters, page: Pagination): Promise<Paginated<School>> {
    let items = [...this.byId.values()];
    if (filters.division) items = items.filter((s) => s.division === filters.division);
    if (filters.region) items = items.filter((s) => s.region === filters.region);
    if (filters.state) items = items.filter((s) => s.state === filters.state);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.city ?? '').toLowerCase().includes(q),
      );
    }
    const total = items.length;
    const start = (page.page - 1) * page.pageSize;
    return paginate(items.slice(start, start + page.pageSize), total, page);
  }
  async count(): Promise<number> {
    return this.byId.size;
  }
}

export class InMemoryPlayerMetricRepository implements IPlayerMetricRepository {
  private readonly all: PlayerMetric[] = [];
  async listByPlayer(playerId: UUID): Promise<PlayerMetric[]> {
    return this.all.filter((m) => m.playerId === playerId);
  }
  async create(input: MetricCreateInput): Promise<PlayerMetric> {
    const m: PlayerMetric = {
      id: randomUUID(),
      playerId: input.playerId,
      type: input.type,
      value: input.value,
      unit: input.unit ?? null,
      measuredAt: input.measuredAt ?? null,
      createdAt: now(),
    };
    this.all.push(m);
    return m;
  }
  async createMany(inputs: readonly MetricCreateInput[]): Promise<PlayerMetric[]> {
    const created: PlayerMetric[] = [];
    for (const i of inputs) created.push(await this.create(i));
    return created;
  }
}

export class InMemorySavedSchoolRepository implements ISavedSchoolRepository {
  private readonly byId = new Map<UUID, SavedSchool>();
  async findByPlayerAndSchool(playerId: UUID, schoolId: UUID): Promise<SavedSchool | null> {
    return (
      [...this.byId.values()].find((s) => s.playerId === playerId && s.schoolId === schoolId) ?? null
    );
  }
  async listByPlayer(playerId: UUID): Promise<SavedSchool[]> {
    return [...this.byId.values()]
      .filter((s) => s.playerId === playerId)
      .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
  }
  async create(input: SavedSchoolUpsertInput): Promise<SavedSchool> {
    const s: SavedSchool = {
      id: randomUUID(),
      playerId: input.playerId,
      schoolId: input.schoolId,
      recruitingStatus: input.recruitingStatus ?? 'INTERESTED',
      personalRating: input.personalRating ?? null,
      isFavorite: input.isFavorite ?? false,
      notes: input.notes ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.byId.set(s.id, s);
    return s;
  }
  async update(id: UUID, input: Partial<SavedSchoolUpsertInput>): Promise<SavedSchool> {
    const existing = this.byId.get(id);
    if (!existing) throw new Error('not found');
    const updated: SavedSchool = { ...existing, ...pruneUndefined(input), updatedAt: now() };
    this.byId.set(id, updated);
    return updated;
  }
  async softDelete(id: UUID): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryRecruitingScoreRepository implements IRecruitingScoreRepository {
  private readonly all: RecruitingScore[] = [];
  async listByPlayer(playerId: UUID, onlyLatest = true): Promise<RecruitingScore[]> {
    return this.all.filter((s) => s.playerId === playerId && (!onlyLatest || s.isLatest));
  }
  async findLatest(playerId: UUID, schoolId: UUID): Promise<RecruitingScore | null> {
    return (
      this.all.find((s) => s.playerId === playerId && s.schoolId === schoolId && s.isLatest) ?? null
    );
  }
  async upsertLatest(input: RecruitingScoreCreateInput): Promise<RecruitingScore> {
    for (const s of this.all) {
      if (s.playerId === input.playerId && s.schoolId === input.schoolId) s.isLatest = false;
    }
    const score: RecruitingScore = {
      id: randomUUID(),
      playerId: input.playerId,
      schoolId: input.schoolId,
      overall: input.overall,
      grade: input.grade,
      confidence: input.confidence,
      classification: input.classification,
      breakdown: input.breakdown,
      engineVersion: input.engineVersion,
      isLatest: true,
      computedAt: now(),
    };
    this.all.push(score);
    return score;
  }
}

export class InMemoryTaskRepository implements ITaskRepository {
  private readonly byId = new Map<UUID, Task>();
  async listByPlayer(playerId: UUID): Promise<Task[]> {
    return [...this.byId.values()].filter((t) => t.playerId === playerId);
  }
  async create(input: { playerId: UUID; text: string; dueDate?: Date | null }): Promise<Task> {
    const t: Task = {
      id: randomUUID(),
      playerId: input.playerId,
      text: input.text,
      status: 'OPEN',
      dueDate: input.dueDate ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    this.byId.set(t.id, t);
    return t;
  }
  async setStatus(id: UUID, status: Task['status']): Promise<Task> {
    const t = this.byId.get(id);
    if (!t) throw new Error('not found');
    const updated: Task = { ...t, status, updatedAt: now() };
    this.byId.set(id, updated);
    return updated;
  }
  async softDelete(id: UUID): Promise<void> {
    this.byId.delete(id);
  }
}

export class InMemoryNotificationRepository implements INotificationRepository {
  private readonly all: Notification[] = [];
  async listByUser(userId: UUID, unreadOnly = false): Promise<Notification[]> {
    return this.all.filter((n) => n.userId === userId && (!unreadOnly || n.readAt === null));
  }
  async create(input: {
    userId: UUID;
    type: Notification['type'];
    title: string;
    body?: string | null;
    data?: unknown;
  }): Promise<Notification> {
    const n: Notification = {
      id: randomUUID(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      data: input.data ?? null,
      readAt: null,
      createdAt: now(),
    };
    this.all.push(n);
    return n;
  }
  async markRead(id: UUID): Promise<Notification> {
    const n = this.all.find((x) => x.id === id);
    if (!n) throw new Error('not found');
    n.readAt = now();
    return n;
  }
}

export class InMemoryAnalyticsRepository implements IAnalyticsRepository {
  readonly events: Array<{ name: string; userId?: UUID; playerId?: UUID; properties?: unknown }> = [];
  async record(input: {
    userId?: UUID;
    playerId?: UUID;
    name: string;
    properties?: unknown;
  }): Promise<void> {
    this.events.push(input);
  }
}

export class InMemoryActivityLogRepository implements IActivityLogRepository {
  readonly logs: Array<{ action: string; entityType: string; entityId: UUID }> = [];
  async record(input: {
    actorUserId?: UUID;
    action: string;
    entityType: string;
    entityId: UUID;
  }): Promise<void> {
    this.logs.push({ action: input.action, entityType: input.entityType, entityId: input.entityId });
  }
}

function pruneUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}
