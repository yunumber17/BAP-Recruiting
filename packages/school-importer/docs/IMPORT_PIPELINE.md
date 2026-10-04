# Import Pipeline

## Architecture

A generic ETL framework (`src/etl`) plus a resource implementation
(`src/schools`). The framework knows nothing about schools; the resource
supplies a `ResourceDefinition` (normalize/map/validate/hash/naturalKey) and an
`UpsertRepository`. Future importers (Players, Coaches, Showcases, Rosters) are
new resource definitions on the same framework.

```
CLI ─▶ importSchools() ─▶ Pipeline.run(source, opts)
                              │
   RecordSource (stream) ─────┤─▶ normalize ─▶ map ─▶ validate ─▶ business-validate
                              │       │
                              │       └─▶ within-file dedupe (natural key)
                              │       └─▶ diff vs existing fingerprint (hash)
                              │              │
                              │              ├─ unchanged+active ─▶ skip
                              │              └─ new/changed/inactive ─▶ batch ─▶ upsert (txn)
                              │
                              ├─ per-batch checkpoint (resume)
                              ├─ end: reactivate reappeared, prune removed (soft)
                              └─ Reporter ─▶ report.json / summary.txt / *.csv
```

## Data flow

1. **Extract** — `CsvStreamSource` (`csv-parse`, `columns:true`) or
   `JsonArraySource` (`stream-json`) yields `{ index, raw }` without buffering.
2. **Normalize** — trim, collapse whitespace, strip zero-width, NFC unicode.
3. **Map** — canonical field ← configurable header list (never by position);
   per-field parsing (division alias → enum, state name → abbr, currency,
   percent, phone → E.164-ish, url, boolean).
4. **Validate** — zod input schema (required fields, URL/email format, enum
   values, state set, numeric ranges). Failures → `validation-errors.csv`.
5. **Business rules** — cross-field checks (e.g. D3 cannot offer athletic
   scholarships). Failures → `validation-errors.csv`.
6. **Dedupe** — a `Set` of seen `extId`s catches within-file duplicates →
   `duplicate-records.csv`.
7. **Diff** — `hashSchool(record)` vs the stored fingerprint decides
   create / update / skip.
8. **Load** — batched `upsert` on the unique `extId` inside a transaction.

## Failure recovery

- **Bad rows / missing columns / invalid enums** — reported and skipped; the run
  continues. Never aborts the whole file for one bad record.
- **Database / constraint errors in a batch** — the batch upsert is retried once;
  if it still fails, every key in the batch is written to `failed-records.csv`,
  counted in `stats.failed`, and the run proceeds. Re-run targeting those rows.
- **Interruption (crash / SIGKILL)** — the checkpoint holds the last committed
  record index; `--resume` skips everything already processed.
- **Atomicity** — each batch upsert runs in one Prisma `$transaction`, so a batch
  either fully commits or rolls back.

## Resume strategy

`Checkpoint` persists `{ file, lastProcessedIndex, stats }` after every batch (and
every `batchSize` records). On `--resume`, records with `index ≤ lastProcessedIndex`
are streamed past and skipped, and prior stats are carried forward. On a clean
completion the checkpoint is deleted; `import-history.jsonl` keeps an audit trail.

## Batch strategy

- Default `--batch-size 500`. Only new/changed rows enter batches (skips cost
  nothing). Larger batches = fewer round-trips but bigger transactions; tune to
  your DB. Fingerprints (`extId → hash`) are the only full-table load, and are
  tiny (~50 bytes/row → ~5 MB at 100k rows).

## Performance considerations

- **Streaming everywhere** — sources and report writers never buffer the file.
- **Skip is O(1)** — unchanged rows do zero DB work (hash compare in memory).
- **One index load, then diffs** — avoids N per-row SELECTs.
- **100k+ rows**: raise `--batch-size` (e.g. 1000–2000), ensure `schools.extId`
  is indexed (it's `@unique` in the schema), and run against the direct
  (non-pooled) connection for the transaction throughput.
- Marking inactive / reactivating use a single `updateMany` each.

## Extension points (future importers)

To add a `players` / `coaches` / `showcases` importer:
1. Define `TRecord` + a zod input schema + `hashX()` (persisted subset).
2. Implement a `ResourceDefinition<TRecord, TKey>` (normalize/map/validate/
   businessValidate/naturalKey/contentHash) — copy `SchoolResource`.
3. Implement `UpsertRepository<TRecord, TKey>` (in-memory + Prisma) — copy the
   Schools repos.
4. Add a thin `importX()` service and a CLI subcommand.
Nothing in `src/etl` changes — the Pipeline, Checkpoint, Reporter, sources, and
report format are shared.
