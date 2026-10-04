import { z } from 'zod';
import {
  uuid, idParam, paginationQuery, Division, Region, Position, Hand, BattingSide, RecruitingStatus,
} from './common.js';

export { idParam, paginationQuery };

// ── Players ──────────────────────────────────────────────────────────────────
export const createPlayerBody = z.object({
  userId: uuid,
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  graduationYear: z.number().int().min(2024).max(2040),
  primaryPosition: Position,
  secondaryPosition: Position.optional(),
  gpa: z.number().min(0).max(5.33).nullish(),
  heightCm: z.number().positive().nullish(),
  weightKg: z.number().positive().nullish(),
  throws: Hand.nullish(),
  bats: BattingSide.nullish(),
  state: z.string().length(2).nullish(),
  country: z.string().length(2).optional(),
});

export const updatePlayerBody = createPlayerBody.omit({ userId: true }).partial();

// ── Schools ──────────────────────────────────────────────────────────────────
export const schoolSearchQuery = paginationQuery.extend({
  q: z.string().min(1).max(100).optional(),
  division: Division.optional(),
  region: Region.optional(),
  state: z.string().length(2).optional(),
});

export const schoolCompareQuery = z.object({
  ids: z
    .string()
    .transform((s) => s.split(',').map((x) => x.trim()))
    .pipe(z.array(uuid).min(2).max(5)),
});

// ── Saved schools ─────────────────────────────────────────────────────────────
export const createSavedSchoolBody = z.object({
  playerId: uuid,
  schoolId: uuid,
  recruitingStatus: RecruitingStatus.optional(),
  personalRating: z.number().int().min(1).max(5).nullish(),
  isFavorite: z.boolean().optional(),
  notes: z.string().max(2000).nullish(),
});

export const updateSavedSchoolBody = z.object({
  playerId: uuid,
  recruitingStatus: RecruitingStatus.optional(),
  personalRating: z.number().int().min(1).max(5).nullish(),
  isFavorite: z.boolean().optional(),
  notes: z.string().max(2000).nullish(),
});

export const savedSchoolIdParams = z.object({ id: uuid, playerId: uuid });

// ── Recruiting ──────────────────────────────────────────────────────────────
export const computeScoreBody = z.object({ playerId: uuid, schoolId: uuid });
export const playerScoresParams = z.object({ playerId: uuid });

// ── Response schemas (contract-verify outputs) ───────────────────────────────
export const playerResponse = z.object({
  id: uuid,
  userId: uuid,
  firstName: z.string(),
  lastName: z.string(),
  graduationYear: z.number(),
  primaryPosition: Position,
}).passthrough();

export const savedSchoolResponse = z.object({
  id: uuid,
  playerId: uuid,
  schoolId: uuid,
  recruitingStatus: RecruitingStatus,
  isFavorite: z.boolean(),
}).passthrough();
