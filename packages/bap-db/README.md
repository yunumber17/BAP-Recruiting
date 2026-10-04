# @bap/db

PostgreSQL data model for the BAP recruiting platform, defined in Prisma.
Fully normalized · UUID primary keys · soft deletes · audit timestamps ·
explicit foreign keys, cascade rules, and indexes.

- **28 models, 26 enums** — validated with the Prisma schema engine (`getDMMF`).
- Covers: Users, Players, Parents, Coaches, Schools, Teams, Player Metrics,
  Videos, Evaluations, Recruiting Scores, Recruiting Preferences, Saved Schools,
  Coach Contacts, Messages, Scholarships, Commitments, Applications, Showcases,
  Tasks, Notifications, Documents, Notes, School Snapshots, Analytics, Activity
  Logs.

## Quick start
```bash
npm install
cp .env.example .env          # set DATABASE_URL
npm run validate              # prisma validate
npx prisma migrate dev --name init
npm run seed                  # load sample data
npm run studio                # browse
```

## Layout
```
prisma/
  schema.prisma   the data model (source of truth)
  seed.ts         idempotent sample data
docs/
  ERD.md          Mermaid entity-relationship diagram
  MIGRATIONS.md   dev/prod migration strategy (+ Supabase notes)
  PERFORMANCE.md  expected row counts, index strategy, scaling recommendations
```

## Design notes
- **UUID PKs** everywhere (`@default(uuid())`), FKs typed `@db.Uuid`.
- **Soft deletes**: mutable business tables carry `deletedAt`; append-only
  tables (analytics, activity logs, notifications, snapshots, scores) do not.
- **Audit**: `createdAt` / `updatedAt` on every mutable table; `activity_logs`
  records who changed what (before/after JSON).
- **Cascade rules**: ownership children cascade from their parent (`onDelete:
  Cascade`); optional cross-links use `SetNull` so a removed reference never
  orphans a row.
- **Indexes** target real access patterns (owner + filter/sort); see
  `docs/PERFORMANCE.md`.
- **Reference bridge**: `School.extId` maps to the scraped `colleges` import id,
  so the College Explorer data and this relational model line up.
- **Engine bridge**: `RecruitingScore` stores the `@bap/recruiting-engine`
  output (overall, grade, confidence, classification, `breakdown` JSON,
  `engineVersion`), one row per (player, school, version).

## Not in scope here (by design)
- Row-level security policies — keep those as ordered SQL alongside migrations
  (see `docs/MIGRATIONS.md`), enabling RLS per player-owned table on `auth.uid()`.
- Wiring to the app — this package is the schema/data layer only.
