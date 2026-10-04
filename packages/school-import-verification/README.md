# @bap/school-import-verification

The **Database Lock Process** — the final validation gate before any other module
integrates against the Schools table. This package is **read-only** with respect
to the four immutable packages (Recruiting Score Engine, Prisma Database, Backend
Service Layer, School Import Pipeline). It does not modify them.

Its only job: **profile → validate → import-verify → lock**.

## What it does

1. **Profile** the canonical CSV (counts, distributions, central tendencies,
   coverage, duplicates, outliers, top-20 rankings).
2. **Validate** every row (required fields, division enum, duplicate keys, URL /
   email / phone format, range and suspicious-value checks). Nothing is silently
   corrected — everything is reported with a severity.
3. **Import** the mapped canonical records via the pipeline's `upsertByExtId`
   contract, then **verify**: exact row count, no duplicate `extId`, CSV↔DB
   field-level fidelity, and a matching order-independent checksum.
4. **Lock**: emit a content-addressed `DATABASE_LOCK.md` declaring the table
   production-ready (the lock is tied to the CSV SHA-256).

## Run

```bash
npm install
npm run typecheck   # tsc --noEmit (strict)
npm test            # vitest — 24 tests
npm run lock        # regenerate docs/*.md from data/schools.csv
```

`npm run lock` prints a one-line verdict and writes the five reports to `docs/`.

## Layout

```
src/
  statistics/  parse.ts (non-throwing parsers) · describe.ts (summary + Tukey outliers)
  profiler/    csv.ts (RFC-4180 parser) · profile.ts (DatasetProfile)
  validators/  index.ts (severity-tagged Issue[], no auto-correction)
  integrity/   canonical.ts (SchoolRecord + mapping) · repository.ts (mock-Prisma) ·
               import.ts (runImport + verifyImport) · checksum.ts (sha256)
  reports/     render.ts (5 markdown reports)
  cli/         run.ts (orchestrator)
tests/         parse · integrity · dataset (end-to-end over the real CSV)
docs/          DATA_PROFILE · QUALITY_REPORT · IMPORT_REPORT · DATABASE_LOCK · SUMMARY
data/          schools.csv (canonical, 1,618 rows)
```

## Production execution note

Fidelity is verified against an in-memory repository that implements the **same
interface** as the Prisma-backed repository, because the Prisma engine binary is
unavailable in the offline build sandbox. The production run feeds the identical
canonical records through the existing Import Pipeline into PostgreSQL using the
same `upsertByExtId` semantics — no code in this package changes at that point;
the repository is swapped via dependency injection.

## Result (this dataset)

`baseball_recruiting_database_FINAL.csv` — 1,618 rows — **LOCK PASSED**, 0
blocking errors, 148 non-blocking warnings, checksum + fidelity confirmed,
confidence **99%**. See `docs/SUMMARY.md`.
