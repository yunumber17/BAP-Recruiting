# IMPORT_REPORT

**Generated:** 2026-07-02T02:38:51.533Z
**Importer version:** school-importer@1.0.0
**Verifier version:** school-import-verification@1.0.0

## Import outcome

| Metric | Value |
|---|---|
| Rows attempted | 1618 |
| Inserted | 1618 |
| Updated | 0 |
| Failed transactions | 0 |

✅ No failed transactions.

## Post-import verification

| Check | Result |
|---|---|
| Exactly 1618 rows | ✅ (actual 1618) |
| No duplicate extIds | ✅ |
| CSV↔DB checksum match | ✅ |
| Field-level fidelity | ✅ 0 mismatches |
| Rows without a conference | 0 |

## Checksums

- **CSV-derived record checksum:** `823e0522d2fca677f4fc2b83863d7aba1286c4e1fdb7f004ba1a453680e14230`
- **DB-derived record checksum:** `823e0522d2fca677f4fc2b83863d7aba1286c4e1fdb7f004ba1a453680e14230`
- **Match:** YES ✅

## Indexes, constraints & foreign keys (Prisma schema — immutable)

The canonical `School` model provides:
- **Primary key:** `id` (UUID)
- **Unique constraint:** `extId` (natural key used for idempotent upserts)
- **Indexes:** `division`, `state`, `conference` (query paths for the Explorer/Score Engine)
- **Referential integrity:** saved-school / recruiting-score relations reference `School.id` with cascade rules

These are defined and enforced by the immutable Prisma package and were not modified by this process.

## Note on execution

Import fidelity was verified against a mock-Prisma repository (identical interface to the production Prisma repo) because the Prisma engine binary is unavailable in the offline build sandbox. The production run uses the same records and the same `upsertByExtId` semantics against PostgreSQL via the existing Import Pipeline.
