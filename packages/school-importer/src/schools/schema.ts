import { z } from 'zod';
import { DIVISIONS, REGIONS, US_STATES } from '../config/reference.js';
import { contentHash } from '../utils/hash.js';

/**
 * Persisted School fields — the ONLY columns the importer maintains (they exist
 * in the immutable Prisma schema). email / phone / graduationRate are validated
 * on input for data quality but are NOT persisted (no such columns), so they are
 * excluded from the content hash to keep re-imports idempotent.
 */
export const SchoolInputSchema = z
  .object({
    extId: z.number().int().positive(),
    name: z.string().min(1).max(200),
    city: z.string().max(120).nullish(),
    state: z
      .string()
      .refine((s) => US_STATES.has(s), { message: 'invalid US state abbreviation' })
      .nullish(),
    region: z.enum(REGIONS).nullish(),
    division: z.enum(DIVISIONS),
    conference: z.string().max(120).nullish(),
    type: z.enum(['Public', 'Private']).nullish(),
    enrollment: z.number().int().min(0).max(200000).nullish(),
    tuition: z.number().int().min(0).max(120000).nullish(),
    acceptanceRate: z.number().min(0).max(1).nullish(),
    rosterSize: z.number().int().min(0).max(120).nullish(),
    scholarshipAvailable: z.boolean().nullish(),
    website: z.string().url().nullish(),
    // validated-but-not-persisted:
    email: z.string().email().nullish(),
    phone: z.string().min(7).max(20).nullish(),
    graduationRate: z.number().min(0).max(1).nullish(),
  })
  .strict();

export type SchoolInput = z.infer<typeof SchoolInputSchema>;

/** The persisted subset. */
export interface SchoolRecord {
  extId: number;
  name: string;
  city: string | null;
  state: string | null;
  region: (typeof REGIONS)[number] | null;
  division: (typeof DIVISIONS)[number];
  conference: string | null;
  type: string | null;
  enrollment: number | null;
  tuition: number | null;
  acceptanceRate: number | null;
  rosterSize: number | null;
  scholarshipAvailable: boolean | null;
  website: string | null;
}

export function toRecord(input: SchoolInput): SchoolRecord {
  return {
    extId: input.extId,
    name: input.name,
    city: input.city ?? null,
    state: input.state ?? null,
    region: input.region ?? null,
    division: input.division,
    conference: input.conference ?? null,
    type: input.type ?? null,
    enrollment: input.enrollment ?? null,
    tuition: input.tuition ?? null,
    acceptanceRate: input.acceptanceRate ?? null,
    rosterSize: input.rosterSize ?? null,
    scholarshipAvailable: input.scholarshipAvailable ?? null,
    website: input.website ?? null,
  };
}

/** Single source of truth for the change-detection hash (repo + resource use it). */
export function hashSchool(record: SchoolRecord): string {
  return contentHash(record);
}
