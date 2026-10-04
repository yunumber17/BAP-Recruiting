/**
 * Runtime wiring for the Prisma-backed Schools repository. Lives in the excluded
 * prisma dir; the CLI dynamic-imports it only for real DB runs. Built via
 * tsconfig.build.json once @bap/database has generated its client.
 */
import { PrismaClient } from '@prisma/client';
import type { UpsertRepository } from '../../../etl/types.js';
import type { SchoolRecord } from '../../schema.js';
import { PrismaSchoolRepo } from './PrismaSchoolRepo.js';

export function createPrismaSchoolRepo(): {
  repo: UpsertRepository<SchoolRecord, number>;
  disconnect: () => Promise<void>;
} {
  const prisma = new PrismaClient();
  return { repo: new PrismaSchoolRepo(prisma), disconnect: () => prisma.$disconnect() };
}
