import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseCsv } from "../profiler/csv.js";
import { toRecord } from "../integrity/canonical.js";
import { profileDataset } from "../profiler/profile.js";
import { validate } from "../validators/index.js";
import { InMemorySchoolRepository } from "../integrity/repository.js";
import { runImport, verifyImport } from "../integrity/import.js";
import { sha256 } from "../integrity/checksum.js";
import {
  renderDataProfile, renderQualityReport, renderImportReport,
  renderDatabaseLock, renderSummary, type LockContext,
} from "../reports/render.js";

const IMPORTER_VERSION = "school-importer@1.0.0";
const SCHEMA_VERSION = "bap-db@1.0.0 (School model)";
const VERIFIER_VERSION = "school-import-verification@1.0.0";
const EXPECTED_ROWS = 1618;

function arg(flag: string, fallback: string): string {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
}

// Confidence blends structural correctness (heavy weight) with enrichment
// coverage of the fields downstream features actually consume.
function computeConfidence(errorCount: number, verifyOk: boolean, coreCoverage: number): number {
  if (!verifyOk || errorCount > 0) return Math.min(60, Math.round(coreCoverage));
  return Math.min(99, Math.round(85 + coreCoverage * 0.14));
}

async function main(): Promise<void> {
  const csvPath = resolve(arg("--csv", "data/schools.csv"));
  const outDir = resolve(arg("--out", "docs"));
  mkdirSync(outDir, { recursive: true });

  const raw = readFileSync(csvPath);
  const table = parseCsv(raw.toString("utf8"));
  const rows = table.rows;
  const records = rows.map(toRecord);

  const profile = profileDataset(records);
  const validation = validate(records, rows);

  const repo = new InMemorySchoolRepository();
  const importResult = await runImport(records, repo);
  const verify = await verifyImport(records, repo, EXPECTED_ROWS);

  const passed = validation.errorCount === 0 && verify.ok;
  const coreFields = ["name", "state", "division", "conference", "enrollment", "acceptanceRate", "graduationRate", "tuitionOutState", "rosterSize"];
  const coreCoverage = coreFields
    .map((f) => profile.coverage.find((c) => c.field === f)?.pct ?? 0)
    .reduce((a, b) => a + b, 0) / coreFields.length;
  const confidence = computeConfidence(validation.errorCount, verify.ok, coreCoverage);

  const ctx: LockContext = {
    csvFile: csvPath.split("/").slice(-1)[0] ?? csvPath,
    csvSha256: sha256(raw),
    csvBytes: raw.byteLength,
    generatedAt: new Date().toISOString(),
    importerVersion: IMPORTER_VERSION,
    schemaVersion: SCHEMA_VERSION,
    verifierVersion: VERIFIER_VERSION,
  };

  const files: Record<string, string> = {
    "DATA_PROFILE.md": renderDataProfile(profile, ctx),
    "QUALITY_REPORT.md": renderQualityReport(profile, validation, ctx),
    "IMPORT_REPORT.md": renderImportReport(importResult, verify, ctx),
    "DATABASE_LOCK.md": renderDatabaseLock(profile, verify, validation, ctx, passed),
    "SUMMARY.md": renderSummary(profile, validation, verify, ctx, passed, confidence),
  };
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(outDir, name), content, "utf8");
  }

  process.stdout.write(
    [
      `Rows: ${records.length} (expected ${EXPECTED_ROWS})`,
      `Validation: ${validation.errorCount} errors, ${validation.warningCount} warnings`,
      `Import: inserted=${importResult.inserted} updated=${importResult.updated} failed=${importResult.failed}`,
      `Verify ok: ${verify.ok} | checksum match: ${verify.checksumMatch} | fidelity mismatches: ${verify.fieldMismatches.length}`,
      `CSV SHA-256: ${ctx.csvSha256}`,
      `DB checksum: ${verify.checksumDb}`,
      `LOCK: ${passed ? "PASSED" : "FAILED"} | confidence ${confidence}%`,
      `Reports written to ${outDir}`,
    ].join("\n") + "\n",
  );

  if (!passed) process.exitCode = 1;
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e instanceof Error ? e.stack ?? e.message : String(e)}\n`);
  process.exitCode = 1;
});
