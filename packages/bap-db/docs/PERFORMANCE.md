# Performance: row counts, index strategy, recommendations

## Expected row counts (order-of-magnitude, per 10,000 active players)

| Table | Rows / player | @ 10k players | Growth driver |
|---|---:|---:|---|
| users | ~1.4 | 14,000 | players + parents + staff |
| players | 1 | 10,000 | signups |
| parents | ~0.8 | 8,000 | guardians |
| player_guardians | ~1 | 10,000 | links |
| schools | — | ~1,700 | fixed reference set |
| school_snapshots | — | ~20,000 | ~12 refreshes/school/yr |
| coaches | — | ~8,000 | ~4–5 per school + club/HS |
| teams | ~0.3 | 3,000 | shared HS/club teams |
| team_memberships | ~1.5 | 15,000 | HS + club |
| player_metrics | ~15 | 150,000 | re-tested over time |
| videos | ~3 | 30,000 | |
| evaluations | ~2 | 20,000 | |
| recruiting_scores | ~40 | 400,000 | player × saved/considered schools × versions |
| recruiting_preferences | 1 | 10,000 | |
| saved_schools | ~15 | 150,000 | |
| coach_contacts | ~20 | 200,000 | |
| messages | ~60 | 600,000 | email threads |
| scholarships | ~1.5 | 15,000 | |
| commitments | ~0.3 | 3,000 | |
| applications | ~6 | 60,000 | |
| showcase_events | — | ~2,000 | shared |
| player_showcases | ~4 | 40,000 | |
| tasks | ~12 | 120,000 | |
| notifications | ~50 | 500,000 | fan-out |
| documents | ~5 | 50,000 | |
| notes | ~10 | 100,000 | |
| **analytics_events** | ~500 | **5,000,000** | every UI action |
| **activity_logs** | ~40 | 400,000 | every write |

The two hotspots are `analytics_events` (dominant) and `messages` /
`recruiting_scores` / `notifications`. Everything else stays comfortably in the
low-hundred-thousands at 10k players and scales linearly.

## Index strategy

**Principles**
- Index every foreign key that is queried (Postgres does *not* auto-index FKs).
- Prefer **composite** indexes that match the app's real access pattern
  (`owner_id + filter/sort`) over single-column indexes.
- Order composite columns: equality predicates first, then range/sort last.
- Don't over-index write-heavy tables — each index is write amplification.

**Applied in the schema**
- Ownership + filter: `saved_schools(playerId, recruitingStatus)`,
  `coach_contacts(playerId, status)`, `tasks(playerId, status)`,
  `applications(playerId, status)`.
- Ownership + sort: `player_metrics(playerId, type, measuredAt)`,
  `messages(contactId, sentAt)`, `recruiting_scores(playerId, computedAt)`.
- "Current" lookups: `recruiting_scores(playerId, isLatest)`,
  `saved_schools(playerId, isFavorite)`.
- Reference search: `schools(division)`, `schools(state)`, `schools(conference)`,
  `schools(name)` — matches the College Explorer's Division/Region/State/name
  filters.
- Uniques that double as indexes: `saved_schools(playerId, schoolId)`,
  `applications(playerId, schoolId)`, `recruiting_scores(playerId, schoolId, engineVersion)`,
  `player_guardians(playerId, parentId)`, `player_showcases(playerId, eventId)`.
- Soft-delete filtering: `users(deletedAt)`, `players(deletedAt)`.

**Recommended follow-ups once traffic is known**
- `notifications`: keep `(userId, readAt)`; consider a **partial** index
  `WHERE readAt IS NULL` for the unread badge (hand-write in a migration —
  Prisma can't express partial indexes yet).
- `schools(name)`: for fuzzy search add a **GIN trigram** index
  (`CREATE EXTENSION pg_trgm; CREATE INDEX … USING gin (name gin_trgm_ops)`).
- `school_snapshots`, `recruiting_scores`: if you only ever read the newest,
  a partial index `WHERE isLatest` (scores) or a `DISTINCT ON` query keeps reads
  O(players) instead of O(history).
- JSONB (`breakdown`, `properties`, `coachPreferences`): add GIN indexes only if
  you filter inside them; otherwise leave unindexed.

## Table-specific recommendations

- **analytics_events (5M+)**: highest volume. Partition by month
  (`PARTITION BY RANGE (occurredAt)`), retain 3–6 months hot, roll older
  partitions to cold storage / a warehouse. Never `SELECT *` without a time
  bound. This is the one table to move off the primary OLTP path early
  (consider a separate analytics sink).
- **messages / notifications**: append-heavy; the composite indexes above cover
  reads. Archive/purge read notifications on a schedule.
- **recruiting_scores**: bounded by (players × schools considered). Store one row
  per (player, school, engineVersion) — the unique constraint prevents
  recompute bloat. Flip `isLatest` on recompute rather than inserting endlessly.
- **schools**: tiny and read-mostly — cache the full set in the app; it changes
  only when the scraper reloads.
- **activity_logs**: append-only audit; same partition/retention treatment as
  analytics if it grows.

## Query hygiene
- Always scope player-owned reads by `playerId` (hits the composite indexes).
- Use `select`/`include` narrowly — avoid pulling `breakdown`/`properties` JSON
  unless needed.
- Paginate large lists with keyset pagination (`WHERE (sortCol, id) < (…)`),
  not `OFFSET`, on messages/analytics.
- Use a connection pooler (pgBouncer / Supabase pooler, transaction mode) and
  Prisma's `connection_limit` tuned to the pool.

## Data types worth noting
- Money/measurables use `Decimal` (exact), never float.
- `gpa Decimal(4,2)` supports weighted scales up to 99.99.
- Coordinates `Decimal(9,6)`; acceptance rate `Decimal(4,3)`.
- Enums are stored as Postgres enums — compact and index-friendly; adding a
  value is a cheap `ALTER TYPE … ADD VALUE`.
