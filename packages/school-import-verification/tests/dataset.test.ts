import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseCsv } from "../src/profiler/csv.js";
import { toRecord } from "../src/integrity/canonical.js";
import { profileDataset } from "../src/profiler/profile.js";
import { validate } from "../src/validators/index.js";
import { InMemorySchoolRepository } from "../src/integrity/repository.js";
import { runImport, verifyImport } from "../src/integrity/import.js";

// Full end-to-end integration test against the canonical dataset.
const CSV = resolve(__dirname, "../data/schools.csv");
const has = existsSync(CSV);

describe.runIf(has)("canonical dataset end-to-end", () => {
  const table = parseCsv(readFileSync(CSV, "utf8"));
  const records = table.rows.map(toRecord);

  it("has exactly 1618 rows", () => {
    expect(records.length).toBe(1618);
  });

  it("every row maps to a valid division", () => {
    expect(records.every((r) => ["D1", "D2", "D3", "NAIA", "JUCO"].includes(r.division))).toBe(true);
  });

  it("has zero blocking validation errors", () => {
    const v = validate(records, table.rows);
    expect(v.errorCount).toBe(0);
  });

  it("imports 1618 rows with full fidelity and matching checksum", async () => {
    const repo = new InMemorySchoolRepository();
    const imp = await runImport(records, repo);
    expect(imp.failed).toBe(0);
    const v = await verifyImport(records, repo, 1618);
    expect(v.rowCountMatch).toBe(true);
    expect(v.checksumMatch).toBe(true);
    expect(v.fieldMismatches.length).toBe(0);
    expect(v.ok).toBe(true);
  });

  it("core scoring fields are >=98% covered", () => {
    const p = profileDataset(records);
    const cov = (f: string): number => p.coverage.find((c) => c.field === f)?.pct ?? 0;
    for (const f of ["enrollment", "acceptanceRate", "graduationRate", "tuitionOutState", "rosterSize"]) {
      expect(cov(f)).toBeGreaterThanOrEqual(98);
    }
  });

  it("identity fields are 100% covered", () => {
    const p = profileDataset(records);
    const cov = (f: string): number => p.coverage.find((c) => c.field === f)?.pct ?? 0;
    for (const f of ["name", "city", "state", "division", "conference"]) {
      expect(cov(f)).toBe(100);
    }
  });
});
