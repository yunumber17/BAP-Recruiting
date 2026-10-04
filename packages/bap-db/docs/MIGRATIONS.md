# Migration strategy

## Local development
```bash
npm install
cp .env.example .env          # point DATABASE_URL at a local/branch db
npx prisma migrate dev --name init   # creates prisma/migrations + applies
npm run seed
```
`migrate dev` diffs the schema against the shadow database, generates a
timestamped SQL migration under `prisma/migrations/`, applies it, and
regenerates the client. Commit the migration folder.

## Staging / production
```bash
npx prisma migrate deploy     # applies committed migrations, no shadow db
```
- `migrate deploy` never generates or edits migrations — it only applies what's
  in `prisma/migrations`. Safe for CI/CD.
- Run it as a release step **before** the new app version boots.

## Supabase specifics
- Use the **direct** connection (port 5432, `DIRECT_URL`) for `migrate`; use the
  **pooled** pgBouncer URL (port 6543, `?pgbouncer=true`) for the app runtime.
  Add `directUrl = env("DIRECT_URL")` to the `datasource` block when wiring
  Supabase so migrations bypass the pooler.
- RLS: Prisma manages tables/columns/indexes, **not** row-level security. Keep
  RLS policies in a separate, ordered SQL migration (or Supabase migration) that
  runs after `migrate deploy`. Enable RLS on every player-owned table and gate on
  `auth.uid()` (mirrors the existing app policies).

## Zero-downtime / expand-contract
For breaking changes, split into additive then destructive migrations:
1. **Expand**: add new nullable column / new table / new index
   (`CREATE INDEX CONCURRENTLY` for large tables — edit the generated SQL to add
   `CONCURRENTLY`, and set the migration to run outside a transaction).
2. **Backfill**: batch-update in the app or a one-off job.
3. **Contract**: once traffic uses the new shape, drop the old column/constraint
   in a later migration.

## Soft deletes
`deletedAt` is a column, not a DB feature. Enforce "hide soft-deleted rows" with
a Prisma Client extension (global `where: { deletedAt: null }`) or explicit
filters. Hard-delete/purge jobs can run on a schedule for compliance.

## Seeding
`prisma db seed` runs `prisma/seed.ts` (idempotent upserts). Safe to re-run in
dev; do not run against production.

## Conventions
- Never edit an applied migration — add a new one.
- One logical change per migration; name them (`--name add_commitments`).
- Review the generated SQL for large tables before deploying (locks, rewrites).
