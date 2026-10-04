import type { SchoolRecord } from "./canonical.js";

export interface SchoolRepository {
  upsertByExtId(record: SchoolRecord): Promise<"inserted" | "updated">;
  count(): Promise<number>;
  findAll(): Promise<readonly SchoolRecord[]>;
  findByExtId(extId: string): Promise<SchoolRecord | null>;
}

// In-memory stand-in for the Prisma-backed repository (mock Prisma). The
// production run swaps in the immutable Import Pipeline's repo (same interface).
export class InMemorySchoolRepository implements SchoolRepository {
  private readonly store = new Map<string, SchoolRecord>();
  async upsertByExtId(record: SchoolRecord): Promise<"inserted" | "updated"> {
    const exists = this.store.has(record.extId);
    this.store.set(record.extId, record);
    return exists ? "updated" : "inserted";
  }
  async count(): Promise<number> { return this.store.size; }
  async findAll(): Promise<readonly SchoolRecord[]> { return [...this.store.values()]; }
  async findByExtId(extId: string): Promise<SchoolRecord | null> { return this.store.get(extId) ?? null; }
}
