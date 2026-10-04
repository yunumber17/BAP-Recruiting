/**
 * Domain DTOs — the shapes services and controllers speak in. They mirror the
 * @bap/database Prisma models but are decoupled from the generated client, so
 * this package compiles and tests without a generated Prisma client. Prisma
 * repositories map rows → these DTOs.
 */
import type { UUID } from './common.js';

export type Division = 'D1' | 'D2' | 'D3' | 'NAIA' | 'JUCO';
export type Region = 'WEST' | 'MIDWEST' | 'SOUTH' | 'NORTHEAST';
export type Position =
  | 'P' | 'C' | 'FIRST_BASE' | 'SECOND_BASE' | 'THIRD_BASE' | 'SHORTSTOP'
  | 'LEFT_FIELD' | 'CENTER_FIELD' | 'RIGHT_FIELD' | 'OUTFIELD' | 'DH' | 'UTILITY';
export type Hand = 'R' | 'L';
export type BattingSide = 'R' | 'L' | 'S';
export type RecruitingStatus =
  | 'INTERESTED' | 'RESEARCHING' | 'PLANNING' | 'CONTACTED' | 'AWAITING' | 'APPLIED' | 'DECLINED';
export type ContactStatus =
  | 'NONE' | 'SENT' | 'OPENED' | 'REPLIED' | 'INTEREST' | 'MEETING' | 'CLOSED';
export type Classification = 'REACH' | 'TARGET' | 'SAFETY';
export type ApplicationStatus =
  | 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'ACCEPTED' | 'DENIED' | 'WAITLISTED';
export type TaskStatus = 'OPEN' | 'DONE';
export type NotificationType =
  | 'COACH_VIEW' | 'MESSAGE' | 'SCHOOL_UPDATE' | 'DEADLINE' | 'SCORE_READY' | 'SYSTEM';
export type MetricType =
  | 'EXIT_VELOCITY' | 'PITCHING_VELOCITY' | 'THROWING_VELOCITY' | 'INFIELD_VELOCITY'
  | 'OUTFIELD_VELOCITY' | 'SIXTY_YARD_DASH' | 'POP_TIME' | 'HOME_TO_FIRST'
  | 'BATTING_AVG' | 'ON_BASE_PCT' | 'SLUGGING' | 'ERA' | 'WHIP' | 'K_PER_9'
  | 'HEIGHT_CM' | 'WEIGHT_KG';

export interface Player {
  id: UUID;
  userId: UUID;
  firstName: string;
  lastName: string;
  graduationYear: number;
  gpa: number | null;
  sat: number | null;
  act: number | null;
  primaryPosition: Position;
  secondaryPosition: Position | null;
  heightCm: number | null;
  weightKg: number | null;
  throws: Hand | null;
  bats: BattingSide | null;
  state: string | null;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  id: UUID;
  extId: number | null;
  name: string;
  city: string | null;
  state: string | null;
  region: Region | null;
  division: Division;
  conference: string | null;
  type: string | null;
  enrollment: number | null;
  tuition: number | null;
  scholarshipAvailable: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolSearchFilters {
  q?: string;
  division?: Division;
  region?: Region;
  state?: string;
}

export interface PlayerMetric {
  id: UUID;
  playerId: UUID;
  type: MetricType;
  value: number;
  unit: string | null;
  measuredAt: Date | null;
  createdAt: Date;
}

export interface RecruitingScore {
  id: UUID;
  playerId: UUID;
  schoolId: UUID;
  overall: number;
  grade: string;
  confidence: number;
  classification: Classification;
  breakdown: unknown;
  engineVersion: string;
  isLatest: boolean;
  computedAt: Date;
}

export interface SavedSchool {
  id: UUID;
  playerId: UUID;
  schoolId: UUID;
  recruitingStatus: RecruitingStatus;
  personalRating: number | null;
  isFavorite: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoachContact {
  id: UUID;
  playerId: UUID;
  schoolId: UUID | null;
  coachName: string | null;
  coachEmail: string | null;
  coachRole: string | null;
  status: ContactStatus;
  nextAction: string | null;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: UUID;
  playerId: UUID;
  schoolId: UUID;
  status: ApplicationStatus;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: UUID;
  playerId: UUID;
  text: string;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  title: string;
  body: string | null;
  data: unknown | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface Video {
  id: UUID;
  playerId: UUID;
  kind: string;
  title: string | null;
  url: string;
  createdAt: Date;
}
