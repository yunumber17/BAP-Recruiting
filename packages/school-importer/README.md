# @bap/school-importer

Standalone, **idempotent**, streaming ETL pipeline that safely populates and
maintains the `Schools` table from scraper output. It is the first resource
implemented on a **reusable ETL framework** (Players, Coaches, Showcases, Rosters
plug in the same way).

It touches nothing else: no Recruiting Score Engine, no backend service layer, no
recruiting scores, no API. One responsibility — keep `Schools` correct.

- **Idempotent**: re-importing the same file updates only changed rows, skips
  unchanged ones (content-hash diff on `extId`), and never creates duplicates.
- **Streaming**: CSV via `csv-parse`, JSON arrays via `stream-json` — the file is
  never fully loaded into memory. Handles 1k → 100k+ rows.
- **Safe rerun**: batch commits + per-batch checkpoint enable `--resume`.
- **Never destructive**: rows removed from source are marked inactive
  (`deletedAt`), not deleted; reappearing rows are reactivated.
- **Reports**: `import-report.json`, `summary.txt`, `failed-records.csv`,
  `duplicate-records.csv`, `validation-errors.csv`.
- **Strict TypeScript**, Pino logging, **22 tests** (validation, normalization,
  duplicate detection, upsert diff, prune/reactivate, dry-run, resume) — green.

## Usage
```bash
npm install
npm run import                          # import schools.csv → Postgres
npm run import -- --file schools.json   # csv or json (auto-detected)
npm run import -- --dry-run             # no writes; report what WOULD change
npm run import -- --validate-only       # validate + report only (no DB)
npm run import -- --resume              # continue an interrupted run
npm run import -- --report              # print the last import-report.json
# flags: --format csv|json  --batch-size N  --mapping map.json  --no-prune
```
`--dry-run` and `--validate-only` need no database. A real import loads the
Prisma repository at runtime (build it once `@bap/database` has run
`prisma generate`).

## Layout
```
src/
  etl/              REUSABLE framework
    types.ts        ResourceDefinition, UpsertRepository, RecordSource, options
    sources.ts      CsvStreamSource, JsonArraySource (streaming)
    Pipeline.ts     orchestrator: normalize→map→validate→dedupe→diff→upsert→report
    Checkpoint.ts   resume state (last processed index + stats)
    Reporter.ts     streaming report writers + import-report.json/summary.txt
  config/           reference data (divisions/states/regions), CLI options
  schools/          the Schools RESOURCE on the framework
    normalize.ts    whitespace/currency/percent/phone/url/int
    schema.ts       zod input schema + persisted SchoolRecord + hashSchool()
    mapping.ts      configurable column mapping (by header, never position)
    SchoolResource.ts   assembles the ResourceDefinition
    repositories/   InMemorySchoolRepo (tested) + prisma/PrismaSchoolRepo (built separately)
  services/importSchools.ts   wires resource + source + pipeline
  utils/            pino logger, hash, csv writer
  cli/index.ts      argument parsing + dispatch
tests/              vitest
docs/IMPORT_PIPELINE.md   architecture, data flow, recovery, resume, batching, extension
```

## Idempotency, precisely
1. Load `extId → { hash, active }` for all existing rows (one query).
2. Per record: normalize → map → validate → business-rules → within-file dedupe.
3. Compute `hashSchool(record)`. If it equals the stored hash **and** the row is
   active → **skip**. Otherwise **upsert** (create if new, update if changed,
   reactivate if it was inactive).
4. After the file: mark any active row whose `extId` was **not** seen inactive
   (`--no-prune` to disable). Reappeared inactive rows are reactivated.

The hash covers only persisted columns, so validated-but-not-stored fields
(email/phone/graduationRate) never cause spurious updates.

## Building the Prisma path
`src/schools/repositories/prisma/**` is excluded from the offline typecheck
because it imports the generated Prisma client. After `prisma generate` in
`@bap/database`, `npm run build` (tsconfig.build.json) compiles it and the CLI's
real-import path works.
