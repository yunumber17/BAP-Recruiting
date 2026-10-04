/**
 * Repository interfaces — the ONLY contract services depend on. Prisma and
 * in-memory implementations both satisfy these, so services are testable with
 * mocks and swappable in production. Repositories never contain business logic.
 */
import type { Pagination, Paginated, UUID } from '../types/common.js';
import type {
  Player, School, SchoolSearchFilters, PlayerMetric, RecruitingScore, SavedSchool,
  CoachContact, Application, Task, Notification, Video, RecruitingStatus,
} from '../types/models.js';

export interface PlayerCreateInput {
  userId: UUID;
  firstName: string;
  lastName: string;
  graduationYear: number;
  primaryPosition: Player['primaryPosition'];
  gpa?: number | null;
  secondaryPosition?: Player['secondaryPosition'];
  heightCm?: number | null;
  weightKg?: number | null;
  throws?: Player['throws'];
  bats?: Player['bats'];
  state?: string | null;
  country?: string;
}
export type PlayerUpdateInput = Partial<Omit<PlayerCreateInput, 'userId'>>;

export interface IPlayerRepository {
  findById(id: UUID): Promise<Player | null>;
  findByUserId(userId: UUID): Promise<Player | null>;
  create(input: PlayerCreateInput): Promise<Player>;
  update(id: UUID, input: PlayerUpdateInput): Promise<Player>;
  softDelete(id: UUID): Promise<void>;
}

export interface ISchoolRepository {
  findById(id: UUID): Promise<School | null>;
  findManyByIds(ids: readonly UUID[]): Promise<School[]>;
  search(filters: SchoolSearchFilters, page: Pagination): Promise<Paginated<School>>;
  count(): Promise<number>;
}

export interface MetricCreateInput {
  playerId: UUID;
  type: PlayerMetric['type'];
  value: number;
  unit?: string | null;
  measuredAt?: Date | null;
}
export interface IPlayerMetricRepository {
  listByPlayer(playerId: UUID): Promise<PlayerMetric[]>;
  create(input: MetricCreateInput): Promise<PlayerMetric>;
  createMany(inputs: readonly MetricCreateInput[]): Promise<PlayerMetric[]>;
}

export interface SavedSchoolUpsertInput {
  playerId: UUID;
  schoolId: UUID;
  recruitingStatus?: RecruitingStatus;
  personalRating?: number | null;
  isFavorite?: boolean;
  notes?: string | null;
}
export interface ISavedSchoolRepository {
  findByPlayerAndSchool(playerId: UUID, schoolId: UUID): Promise<SavedSchool | null>;
  listByPlayer(playerId: UUID): Promise<SavedSchool[]>;
  create(input: SavedSchoolUpsertInput): Promise<SavedSchool>;
  update(id: UUID, input: Partial<SavedSchoolUpsertInput>): Promise<SavedSchool>;
  softDelete(id: UUID): Promise<void>;
}

export interface RecruitingScoreCreateInput {
  playerId: UUID;
  schoolId: UUID;
  overall: number;
  grade: string;
  confidence: number;
  classification: RecruitingScore['classification'];
  breakdown: unknown;
  engineVersion: string;
}
export interface IRecruitingScoreRepository {
  listByPlayer(playerId: UUID, onlyLatest?: boolean): Promise<RecruitingScore[]>;
  findLatest(playerId: UUID, schoolId: UUID): Promise<RecruitingScore | null>;
  upsertLatest(input: RecruitingScoreCreateInput): Promise<RecruitingScore>;
}

export interface ITaskRepository {
  listByPlayer(playerId: UUID): Promise<Task[]>;
  create(input: { playerId: UUID; text: string; dueDate?: Date | null }): Promise<Task>;
  setStatus(id: UUID, status: Task['status']): Promise<Task>;
  softDelete(id: UUID): Promise<void>;
}

export interface INotificationRepository {
  listByUser(userId: UUID, unreadOnly?: boolean): Promise<Notification[]>;
  create(input: {
    userId: UUID;
    type: Notification['type'];
    title: string;
    body?: string | null;
    data?: unknown;
  }): Promise<Notification>;
  markRead(id: UUID): Promise<Notification>;
}

// Interfaces for the remaining entities (same shape; wire when their services land).
export interface ICoachContactRepository {
  listByPlayer(playerId: UUID): Promise<CoachContact[]>;
  findById(id: UUID): Promise<CoachContact | null>;
}
export interface IApplicationRepository {
  listByPlayer(playerId: UUID): Promise<Application[]>;
}
export interface IVideoRepository {
  listByPlayer(playerId: UUID): Promise<Video[]>;
}
export interface IAnalyticsRepository {
  record(input: { userId?: UUID; playerId?: UUID; name: string; properties?: unknown }): Promise<void>;
}
export interface IActivityLogRepository {
  record(input: {
    actorUserId?: UUID;
    action: string;
    entityType: string;
    entityId: UUID;
    before?: unknown;
    after?: unknown;
  }): Promise<void>;
}
