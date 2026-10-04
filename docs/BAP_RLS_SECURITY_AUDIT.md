# BAP Recruiting — Row Level Security (RLS) Audit

**Date:** 2026-07-03
**Scope:** Database access control (Supabase / Postgres RLS) across all `*.sql` migration files.
**Method:** Static review of the migration SQL in the project. No changes were made. See the caveat below.

> ⚠️ **Important caveat — the live database is the source of truth.**
> This audit reviews your migration *files*. Your actual Supabase project is what enforces security, and it can differ (a migration may not have run, or something was changed by hand in the dashboard). Section 6 gives you **read‑only queries** to run in the Supabase SQL editor to confirm the live state. Trust those results over this document.

---

## 1. Overall verdict

**The RLS design is solid.** Every table that holds per‑user data is protected by an owner‑scoped policy (`player_id = auth.uid()` or `id = auth.uid()`), reference tables are read‑only, and the public share path is well designed (token‑scoped RPC, no table enumeration). I found **no dangerously permissive policy** (nothing like `for all using (true)` on user data).

There are **4 things to verify or tighten**, none of which is a confirmed open door — they are gaps between "the files look right" and "the live DB is provably right." They are ranked below.

---

## 2. Per‑table RLS matrix

Legend: **RLS** = row level security enabled · **S/I/U/D** = Select/Insert/Update/Delete allowed and owner‑scoped · **Owner rule** = the predicate that isolates rows.

### Per‑user tables (must be locked to the owner)

| Table | RLS | S | I | U | D | Owner rule | Verdict |
|---|---|---|---|---|---|---|---|
| `players` | ✅ | ✅ | ✅ | ✅ | ⚠️ none | `id = auth.uid()` | OK — delete intentionally denied |
| `tasks` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (FOR ALL) |
| `events` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (FOR ALL) |
| `coach_contacts` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (FOR ALL) |
| `coach_messages` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (FOR ALL) |
| `performance_metrics` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (defined twice — harmless) |
| `improvement_goals` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (FOR ALL) |
| `recruiting_documents` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (defined twice — harmless) |
| `videos` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (FOR ALL) |
| `saved_colleges` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK (defined twice — harmless) |
| `favorite_colleges` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK |
| `email_drafts` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK |
| `player_seasons` | ✅ | ✅ | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK |
| `public_profiles` | ✅ | owner only | ✅ | ✅ | ✅ | `player_id = auth.uid()` | OK — anon reads only via RPC |

### Reference tables (public read, no writes)

| Table | RLS | Read | Write | Verdict |
|---|---|---|---|---|
| `colleges` | ✅ | `using (true)` | denied (no policy) | OK — reference data |
| `camps` | ✅ | `using (true)` | denied (no policy) | OK — reference data |
| `metric_definitions` | ✅ | `using (true)` | denied (no policy) | OK — reference data |

### Public share path

`get_public_profile(p_token text)` — `SECURITY DEFINER`, `STABLE`, `set search_path = public`. Returns the `data` snapshot **only** where `token = p_token AND is_public = true`, `limit 1`. Granted to `anon, authenticated`. **This is the correct pattern:** anonymous visitors cannot list or scan `public_profiles` (the table's own RLS denies them every row); they can only fetch a single snapshot if they already hold the unguessable token. Revocation is instant via `is_public = false`. Tokens are generated client‑side with `crypto.getRandomValues` (128 bits) — unguessable.

---

## 3. Findings, ranked

### 🟠 F‑1 · `do $$ … foreach` RLS loop is all‑or‑nothing (reliability → security)
`bap_supabase_fix.sql` enables RLS and creates policies by looping over a hard‑coded array of table names:
```
foreach t in array array['tasks','events','coach_contacts','coach_messages',
  'performance_metrics','improvement_goals','recruiting_documents','videos','saved_colleges']
```
If **any** table in that array does not exist at run time, `ALTER TABLE … ENABLE ROW LEVEL SECURITY` throws and the **entire `do` block aborts** — every table *after* the failing one is left **without RLS and without a policy**. On a fresh or partially‑migrated database this can silently leave a user table wide open.
**Why it matters:** this is the most realistic path to an actual hole in *your* setup, because it depends on run order, not on the policy logic (which is correct).
**Fix (proposed, not applied):** guard each table with `if to_regclass('public.'||t) is not null then …`, and run a verification query (Section 6) afterward.

### 🟡 F‑2 · A table with RLS enabled but **no policy** denies everything (availability, not a leak)
If RLS gets enabled on a table but its policy never gets created (e.g. because of F‑1), that table returns **zero rows to everyone** — the app breaks rather than leaks. Not a data‑exposure risk, but it looks like a security incident and hides F‑1. The Section 6 query flags these.

### 🟡 F‑3 · Snapshot redaction is enforced in the app, not the database
`get_public_profile` returns the `data` JSONB verbatim. The app is responsible for stripping sensitive fields (contact info, private notes) **before** saving the snapshot (`buildPlayerProfile`). If a future code change accidentally includes a private field in the snapshot, it becomes public. The DB cannot catch this.
**Recommendation:** treat `buildPlayerProfile`'s output as a security boundary — keep an explicit allow‑list of fields, and add a note/test so nobody widens it by accident.

### 🟢 F‑4 · Minor / informational
- **`players` has no DELETE policy** — deletes are denied. Intentional and fine (accounts are removed via `auth.users`, which cascades to child rows). Documented so it isn't mistaken for a gap.
- **Duplicate policies** on `performance_metrics`, `recruiting_documents`, `saved_colleges` (defined both in a dedicated file and in the loop). Harmless — the `drop policy if exists` makes them idempotent.
- **Weak token fallback:** `_genToken` falls back to `Math.random()` if `window.crypto` is unavailable. Modern browsers always have `crypto`, so this is theoretical, but the fallback is not cryptographically secure. Consider failing closed instead of falling back.
- **`coach_directory`** appears only as a commented‑out `create table` — not created, no data, no exposure. Nothing to do unless you enable it later (in which case it needs RLS).

---

## 4. What is NOT a problem (so you don't chase it)
- The Supabase **anon key** being public is by design; it is not a secret. Your protection is RLS, which is in place.
- Reference tables readable with `using (true)` is intentional (colleges/camps/metrics are not sensitive).
- `anon` cannot read any per‑user table: `auth.uid()` is `NULL` for anonymous requests, so `player_id = auth.uid()` matches no rows.

---

## 5. Recommended next steps (in order)
1. **Run the Section 6 verification queries** in your Supabase SQL editor and paste back the results. This confirms the live state and tells us definitively whether F‑1/F‑2 bit you.
2. If any user table shows **RLS = false** or **policy count = 0**, apply the hardened, defensive RLS script (I can generate it — it enables RLS on every user table, (re)creates the owner policy, and is safe to re‑run).
3. Adopt the `buildPlayerProfile` allow‑list note (F‑3).

I have **not** changed any SQL or the app. Say the word and I'll produce the hardened `rls_hardening.sql` for you to review before you run it.

---

## 6. Read‑only verification queries (run these in Supabase → SQL editor)

**6a. Every public table and whether RLS is enabled:**
```sql
select c.relname as table,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relrowsecurity, c.relname;
```
🚩 Investigate any user‑data table where `rls_enabled = false`.

**6b. Policy count per table (spot tables with RLS on but 0 policies = everything denied):**
```sql
select c.relname as table,
       c.relrowsecurity as rls_enabled,
       count(p.polname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public' and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by policy_count, c.relname;
```
🚩 `rls_enabled = true` **and** `policy_count = 0` → app‑breaking (F‑2).
🚩 `rls_enabled = false` on a user table → data exposure (F‑1).

**6c. Full policy detail (confirm each is owner‑scoped, not `true`):**
```sql
select tablename, policyname, cmd,
       qual        as using_expr,
       with_check  as check_expr
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;
```
🚩 Any `using_expr` of `true` (or NULL) on a **user** table, or any `check_expr` that is NULL/`true` for INSERT/UPDATE, means that operation is not owner‑restricted.

**6d. Confirm anon cannot read the share table directly:**
```sql
-- Should return the RPC grant but NOT a broad table grant to anon on public_profiles.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'public_profiles'
order by grantee, privilege_type;
```
