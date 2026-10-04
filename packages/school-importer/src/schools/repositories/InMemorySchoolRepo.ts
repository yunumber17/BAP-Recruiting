import type { ExistingFingerprint, UpsertRepository } from '../../etl/types.js';
import { hashSchool, type SchoolRecord } from '../schema.js';

interface StoredSchool extends SchoolRecord {
  active: boolean;
}

/**
 * In-memory repository — used by tests and dry-runs. Behaves exactly like the
 * Prisma repository: idempotent upsert (create vs update), soft mark-inactive,
 * reactivate. Fingerprints are computed with the same hashSchool() the pipeline
 * uses, so the change-detection contract is identical.
 */
export class InMemorySchoolRepo implements UpsertRepository<SchoolRecord, number> {
  private readonly byExtId = new Map<number, StoredSchool>();

  /** Test/seed helper. */
  seed(records: readonly SchoolRecord[], active = true): void {
    for (const r of records) this.byExtId.set(r.extId, { ...r, active });
  }

  get(extId: number): StoredSchool | undefined {
    return this.byExtId.get(extId);
  }

  get size(): number {
    return this.byExtId.size;
  }

  async loadFingerprints(): Promise<Map<string, ExistingFingerprint<number>>> {
    const map = new Map<string, ExistingFingerprint<number>>();
    for (const s of this.byExtId.values()) {
      const { active, ...record } = s;
      map.set(String(s.extId), { key: s.extId, hash: hashSchool(record), active });
    }
    return map;
  }

  async upsertBatch(records: readonly SchoolRecord[]): Promise<Map<string, 'created' | 'updated'>> {
    const out = new Map<string, 'created' | 'updated'>();
    for (const r of records) {
      const exists = this.byExtId.has(r.extId);
      this.byExtId.set(r.extId, { ...r, active: true }); // upsert reactivates
      out.set(String(r.extId), exists ? 'updated' : 'created');
    }
    return out;
  }

  async markInactive(keys: readonly number[]): Promise<number> {
    let n = 0;
    for (const k of keys) {
      const s = this.byExtId.get(k);
      if (s && s.active) {
        s.active = false;
        n += 1;
      }
    }
    return n;
  }

  async reactivate(keys: readonly number[]): Promise<number> {
    let n = 0;
    for (const k of keys) {
      const s = this.byExtId.get(k);
      if (s && !s.active) {
        s.active = true;
        n += 1;
      }
    }
    return n;
  }
}
