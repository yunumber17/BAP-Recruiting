# DATABASE_LOCK

> Official production-readiness declaration for the **Schools** table.

| Field | Value |
|---|---|
| Date | 2026-07-02T02:38:51.533Z |
| Row count | 1618 |
| CSV file | `schools.csv` |
| CSV SHA-256 | `4785e34a4e7d2110e8cb14a312f624cd58a46edf64d66d1a1887ea36060e729c` |
| CSV bytes | 728,838 |
| Import record checksum | `823e0522d2fca677f4fc2b83863d7aba1286c4e1fdb7f004ba1a453680e14230` |
| Identity checksum basis | name + city + state + division |
| Schema version | bap-db@1.0.0 (School model) |
| Importer version | school-importer@1.0.0 |
| Verifier version | school-import-verification@1.0.0 |
| Verification status | **PASSED ✅** |

## Approval checklist

- [x] Row count is exactly 1618
- [x] Zero duplicate extIds
- [x] Zero true (name+state) duplicates
- [x] Zero blocking validation errors
- [x] CSV↔DB checksum match
- [x] Field-level fidelity confirmed
- [x] Unique constraint on extId (Prisma, immutable)
- [x] Indexes on division / state / conference (Prisma, immutable)

## Declaration

The Schools table is hereby **LOCKED** and declared the **production source of truth** for identity, location, division, conference, academics, financials and roster fields. Downstream packages may integrate against it. Sparse enrichment fields (email, recruiting coordinator, camp link, coach note) remain optional and should be consumed with fallbacks.

_Lock is content-addressed: any change to the CSV changes its SHA-256 and invalidates this lock, requiring re-verification._
