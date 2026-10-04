import type { SchoolRecord } from "./canonical.js";
import type { SchoolRepository } from "./repository.js";
import { checksum } from "./checksum.js";

export interface ImportResult {
  readonly attempted: number;
  readonly inserted: number;
  readonly updated: number;
  readonly failed: number;
  readonly errors: readonly { extId: string; message: string }[];
}

export async function runImport(records: readonly SchoolRecord[], repo: SchoolRepository): Promise<ImportResult> {
  let inserted = 0, updated = 0, failed = 0;
  const errors: { extId: string; message: string }[] = [];
  for (const rec of records) {
    try {
      const outcome = await repo.upsertByExtId(rec);
      if (outcome === "inserted") inserted++; else updated++;
    } catch (e) {
      failed++;
      errors.push({ extId: rec.extId, message: e instanceof Error ? e.message : String(e) });
    }
  }
  return { attempted: records.length, inserted, updated, failed, errors };
}

export interface VerifyResult {
  readonly rowCountMatch: boolean;
  readonly expectedRows: number;
  readonly actualRows: number;
  readonly duplicateExtIds: readonly string[];
  readonly rowsWithoutConference: readonly string[];
  readonly checksumCsv: string;
  readonly checksumDb: string;
  readonly checksumMatch: boolean;
  readonly fieldMismatches: readonly { extId: string; field: string; csv: string; db: string }[];
  readonly ok: boolean;
}

// Field-by-field comparison of the CSV-derived set against the imported
// repository contents, plus checksums and a fidelity verdict.
export async function verifyImport(
  csvRecords: readonly SchoolRecord[], repo: SchoolRepository, expectedRows: number,
): Promise<VerifyResult> {
  const dbRecords = await repo.findAll();
  const actualRows = await repo.count();

  const counts = new Map<string, number>();
  for (const r of csvRecords) counts.set(r.extId, (counts.get(r.extId) ?? 0) + 1);
  const duplicateExtIds = [...counts.entries()].filter(([, c]) => c > 1).map(([k]) => k);

  const rowsWithoutConference = csvRecords.filter((r) => r.conference == null).map((r) => r.extId);

  const dbByExt = new Map(dbRecords.map((r) => [r.extId, r]));
  const fieldMismatches: { extId: string; field: string; csv: string; db: string }[] = [];
  const fields = Object.keys(csvRecords[0] ?? {}) as (keyof SchoolRecord)[];
  for (const rec of csvRecords) {
    const db = dbByExt.get(rec.extId);
    if (!db) { fieldMismatches.push({ extId: rec.extId, field: "*", csv: "present", db: "missing" }); continue; }
    for (const f of fields) {
      const a = JSON.stringify(rec[f]);
      const b = JSON.stringify(db[f]);
      if (a !== b) fieldMismatches.push({ extId: rec.extId, field: String(f), csv: a, db: b });
    }
  }

  const checksumCsv = checksum(csvRecords);
  const checksumDb = checksum(dbRecords);
  const checksumMatch = checksumCsv === checksumDb;
  const rowCountMatch = actualRows === expectedRows && csvRecords.length === expectedRows;
  const ok = rowCountMatch && duplicateExtIds.length === 0 && checksumMatch && fieldMismatches.length === 0;

  return {
    rowCountMatch, expectedRows, actualRows, duplicateExtIds, rowsWithoutConference,
    checksumCsv, checksumDb, checksumMatch, fieldMismatches, ok,
  };
}
