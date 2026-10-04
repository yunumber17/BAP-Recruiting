/**
 * Prisma implementation of the Schools UpsertRepository. Compiles once
 * `prisma generate` has run in @bap/database (excluded from the offline
 * typecheck; included by tsconfig.build.json).
 *
 * Idempotency contract:
 *  - loadFingerprints() hashes existing rows with the SAME hashSchool() the
 *    pipeline uses, so unchanged rows are skipped and only diffs are written.
 *  - upsertBatch() uses prisma.upsert keyed on the unique `extId`; on conflict
 *    it updates the mapped columns and clears deletedAt (reactivate-on-return).
 *  - markInactive() sets deletedAt (soft) — historical rows are never deleted.
 */
import type { PrismaClient, Prisma } from '@prisma/client';
import type { ExistingFingerprint, UpsertRepository } from '../../../etl/types.js';
import { hashSchool, type SchoolRecord } from '../../schema.js';

const SELECT = {
  extId: true, name: true, city: true, state: true, region: true, division: true,
  conference: true, type: true, enrollment: true, tuition: true, acceptanceRate: true,
  rosterSize: true, scholarshipAvailable: true, website: true, deletedAt: true,
} satisfies Prisma.SchoolSelect;

type RowShape = {
  extId: number | null;
  name: string; city: string | null; state: string | null;
  region: SchoolRecord['region']; division: SchoolRecord['division'];
  conference: string | null; type: string | null;
  enrollment: number | null; tuition: number | null;
  acceptanceRate: Prisma.Decimal | null; rosterSize: number | null;
  scholarshipAvailable: boolean | null; website: string | null;
  deletedAt: Date | null;
};

function rowToRecord(r: RowShape): SchoolRecord {
  return {
    extId: r.extId as number,
    name: r.name, city: r.city, state: r.state, region: r.region, division: r.division,
    conference: r.conference, type: r.type, enrollment: r.enrollment, tuition: r.tuition,
    acceptanceRate: r.acceptanceRate === null ? null : Number(r.acceptanceRate),
    rosterSize: r.rosterSize, scholarshipAvailable: r.scholarshipAvailable, website: r.website,
  };
}

function toData(r: SchoolRecord): Prisma.SchoolCreateInput {
  return {
    extId: r.extId, name: r.name, city: r.city, state: r.state, region: r.region ?? undefined,
    division: r.division, conference: r.conference, type: r.type, enrollment: r.enrollment,
    tuition: r.tuition, acceptanceRate: r.acceptanceRate, rosterSize: r.rosterSize,
    scholarshipAvailable: r.scholarshipAvailable, website: r.website,
  };
}

export class PrismaSchoolRepo implements UpsertRepository<SchoolRecord, number> {
  constructor(private readonly prisma: PrismaClient) {}

  async loadFingerprints(): Promise<Map<string, ExistingFingerprint<number>>> {
    const rows = await this.prisma.school.findMany({ where: { extId: { not: null } }, select: SELECT });
    const map = new Map<string, ExistingFingerprint<number>>();
    for (const row of rows as RowShape[]) {
      if (row.extId === null) continue;
      map.set(String(row.extId), {
        key: row.extId,
        hash: hashSchool(rowToRecord(row)),
        active: row.deletedAt === null,
      });
    }
    return map;
  }

  async upsertBatch(records: readonly SchoolRecord[]): Promise<Map<string, 'created' | 'updated'>> {
    const out = new Map<string, 'created' | 'updated'>();
    // One transaction per batch → atomic commit / rollback.
    await this.prisma.$transaction(async (tx) => {
      for (const r of records) {
        const existing = await tx.school.findUnique({ where: { extId: r.extId }, select: { id: true } });
        const data = toData(r);
        await tx.school.upsert({
          where: { extId: r.extId },
          create: data,
          update: { ...data, deletedAt: null }, // reactivate on return
        });
        out.set(String(r.extId), existing ? 'updated' : 'created');
      }
    });
    return out;
  }

  async markInactive(keys: readonly number[]): Promise<number> {
    const res = await this.prisma.school.updateMany({
      where: { extId: { in: [...keys] }, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return res.count;
  }

  async reactivate(keys: readonly number[]): Promise<number> {
    const res = await this.prisma.school.updateMany({
      where: { extId: { in: [...keys] }, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    return res.count;
  }
}
