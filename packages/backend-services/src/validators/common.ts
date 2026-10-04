import { z } from 'zod';

export const uuid = z.string().uuid();

export const idParam = z.object({ id: uuid });

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const Division = z.enum(['D1', 'D2', 'D3', 'NAIA', 'JUCO']);
export const Region = z.enum(['WEST', 'MIDWEST', 'SOUTH', 'NORTHEAST']);
export const Position = z.enum([
  'P', 'C', 'FIRST_BASE', 'SECOND_BASE', 'THIRD_BASE', 'SHORTSTOP',
  'LEFT_FIELD', 'CENTER_FIELD', 'RIGHT_FIELD', 'OUTFIELD', 'DH', 'UTILITY',
]);
export const Hand = z.enum(['R', 'L']);
export const BattingSide = z.enum(['R', 'L', 'S']);
export const RecruitingStatus = z.enum([
  'INTERESTED', 'RESEARCHING', 'PLANNING', 'CONTACTED', 'AWAITING', 'APPLIED', 'DECLINED',
]);
