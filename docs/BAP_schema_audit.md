# BAP Schema Stabilization Audit
*Read-only audit of Supabase schema usage in `bap.html`. No features added, no UI changed. Derived directly from the code (every read/write path grepped).*

## Classification legend
- **CORE** — player-owned source-of-truth data, written and read by the app (RLS on `auth.uid()`).
- **REFERENCE** — public read-only catalog, populated by SQL import, never written by the app.
- **DERIVED / EXTERNAL** — meant to be produced by an engine/service, not written by the app today.
- **DORMANT** — table the app *reads* (loads into state) but has **no write path** in the current UI.

---

## 1. Single Source of Truth Map

| Table | Class | Written by (app) | Read by (app) | Notes |
|---|---|---|---|---|
| **players** | CORE | `upsertPlayerRow` → `players.upsert` (onboarding + profile edit) | `getPlayer`/enterApp → `players.select`; `BAP_STATE.player` | Single writer path. Identity + academics (GPA/SAT/ACT/TOEFL) + physicals. ✅ one source. |
| **coach_contacts** | CORE | `saveContact` (insert), `setContactStatus`/`saveNextAction`/`markDraftSent` (update), `deleteContact` (delete) | `_loadOwned` → `BAP_STATE.contacts` | Now has real `college_id` FK. Status pipeline lives here. ✅ single table for the coach entity. |
| **coach_messages** | CORE | `logMessage` (manual sent/received), `markDraftSent` (draft → sent) | `_loadOwned` → `BAP_STATE.messagesByContact` | **Real sent/inbound messages ONLY.** No drafts. ✅ verified: only 2 writers, both real messages. |
| **email_drafts** | CORE | `saveEmailDraft` (insert), `saveDraftEdit` (update), `deleteDraft`/`markDraftSent` (delete) | `_loadOwned` → `BAP_STATE.drafts` | **Drafts ONLY.** Clean separation from coach_messages. ✅ new first-class table. |
| **colleges** | REFERENCE | *(none — SQL import only)* | paginated `colleges.select` → `BAP_STATE.colleges` | 1,618 rows, UUID PK. App never writes. ✅ correct read-only reference. |
| **camps** | REFERENCE | *(none — SQL import only)* | paginated `camps.select` → `BAP_STATE.camps` | 215 rows. Read-only reference. ✅ |
| **metric_definitions** | REFERENCE | *(none — SQL seed only)* | `metric_definitions.select` → `BAP_STATE.metricDefs` | Catalog; FK target for `performance_metrics.metric_key`. ✅ |
| **performance_metrics** | CORE | `addMetric` (insert), onboarding seed (insert), `deleteMetric` (delete) | `_loadOwned` → `BAP_STATE.metrics` | `metric_key` FK → metric_definitions. Two insert paths, **same concept** (onboarding + manual) — not competing. ✅ |
| **videos** | CORE | `addVideo` (insert), `deleteVideo` (delete) | `_loadOwned` → `BAP_STATE.videos` | Link stored in `storage_path`; `kind` enum. ✅ |
| **improvement_goals** | CORE | `addGoal` (insert) | `_loadOwned` → `BAP_STATE.goals` | ✅ (no edit/delete UI, minor). |
| **saved_colleges** | CORE | `saveCollege`/`setRecruitStatus`/`setCollegeRating`/`saveCollegeNotes` (insert/update), `deleteSavedCollege` | `_loadOwned` → `BAP_STATE.saved` | `college_id` = UUID (matches colleges.id). ✅ |
| **favorite_colleges** | CORE | `toggleFavorite` (insert/delete) | `_loadOwned` → `BAP_STATE.favorites` | ✅ |
| **player_scores** | DERIVED/EXTERNAL | *(none)* | `player_scores.select` → `BAP_STATE.scores` | **Dormant.** Intended for the Score Engine. The 状況 tab now uses in-app readiness, so `scores` is effectively unused. No integrity risk (nullable). |
| **events** | DORMANT | *(none)* | `_loadOwned('events')` → `BAP_STATE.events` | Read-only; "次のイベント" display. **No writer** in the app. |
| **recruiting_documents** | DORMANT | *(none)* | `_loadOwned('recruiting_documents')` → `BAP_STATE.documents` | Read-only; 書類 tab + TOEFL-doc readiness check. **No writer** in the app. |

### Focus tables — verdict
- **players** ✅ one writer (`upsertPlayerRow`), one concept. Clean.
- **coach_contacts** ✅ single entity table; status + next_action + note + `college_id` all live here (no split).
- **coach_messages** ✅ real messages only after the CRM refactor. Verified by grep — no draft writes remain.
- **email_drafts** ✅ drafts only. Strict separation achieved.
- **colleges** ✅ pure read-only reference; app never mutates it.

---

## 2. Migration safety check (`crm_migration.sql`)

**Introduces duplicate columns?** No. `coach_contacts.college_id` is added once with `add column if not exists`; it does not duplicate any existing column (the old approach used the free-text `note`, which is a *different* column and is now demoted to plain notes).

**Overlapping responsibilities?** No — it *removes* overlap. Before: `coach_messages` held both real messages **and** `[下書き]`-prefixed drafts (overlapping concepts). After: `email_drafts` owns drafts, `coach_messages` owns messages. Responsibilities are now disjoint.

**Redundant data storage?** One transitional item: any **legacy `[下書き]` rows** previously written into `coach_messages` are now redundant (drafts live in `email_drafts`). The migration includes a commented cleanup:
```sql
delete from public.coach_messages where body like '[下書き]%';
```
Run it once (after reviewing) to remove the redundancy. New drafts never touch `coach_messages`.

**Verdict:** the migration is **additive and safe** — one new table + one nullable FK, both idempotent, no data loss. No consolidation needed; it *is* the consolidation.

---

## 3. Data integrity check

- **No competing writes for the same concept.** Each concept has exactly one owning table:
  - draft email → `email_drafts` only
  - sent/received message → `coach_messages` only
  - coach entity/status → `coach_contacts` only
  - academics → `players` only
  Verified from the write grep (no table receives writes for a concept that another table also owns).
- **Drafts vs messages separation is strictly enforced.** `coach_messages` has exactly two writers (`logMessage`, `markDraftSent`) — both write *real* messages. Drafts never enter `coach_messages`. ✅
- **`college_id` used consistently.** Set on insert (`saveContact` when added from a college page via `openAddContactForCollege`), read in `collegeContacts(collegeId)` (college page list) and the contact 情報 tab (link back to college). The old `note`-as-link hack is demoted to a display-only fallback and is no longer the linkage mechanism. ✅

### Residual risks / recommendations (simplify, don't expand)
1. **`note` fallback for school** — the contact 情報 tab still shows `note` when `college_id` is absent (e.g. contacts created before the FK existed). Harmless, but to fully retire the implicit link: optionally backfill `college_id` for old rows, then treat `note` as free text only. *(Not required now.)*
2. **Dormant tables (`events`, `recruiting_documents`, `player_scores`)** — the app reads them but never writes them. Recommendation: **document them as "reserved / externally populated"** (as done here) so no one assumes the app maintains them. Don't delete — `recruiting_documents` feeds the TOEFL readiness check; `player_scores` is the Score Engine's future target.
3. **FK target consistency** — player-owned tables key off `auth.uid()` via `player_id`. Confirm all `player_id` columns reference the same anchor (auth user) so RLS + joins stay uniform. This is a one-time DBA check, not an app change.
4. **`improvement_goals`** has insert-only UI (no edit/delete). Low priority; note for later.

---

## Bottom line
The schema is **stable and production-ready for scaling CRM workflows**. The draft/message split is clean, `college_id` is a real FK used consistently, and there are no competing writers. The only housekeeping item is the optional one-line cleanup of legacy `[下書き]` rows in `coach_messages`. No schema redesign or consolidation is warranted — the recent migration already did the consolidation correctly.
