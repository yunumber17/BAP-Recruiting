# BAP Recruiting — Launch Readiness Checklist

Status legend:
- **PASS (code)** — implementation traced end-to-end in `bap.html`; wired correctly, no broken path. Fully verifiable statically.
- **NEEDS-LIVE** — code path is correct, but a true PASS requires a live Supabase/network/device run I can't do from here.
- **FAIL** — a real gap found; needs a decision or fix before launch.

I can't click your localhost/Supabase, so anything involving a real network round-trip or a physical device is marked NEEDS-LIVE with exactly what to check.

| # | Workflow | Status | Notes |
|---|----------|--------|-------|
| 1 | Sign up | PASS (code) / needs-live | `doRegister()` → `goSetup()`. Verify live that Supabase `signUp` succeeds. |
| 2 | Email verification | NEEDS-LIVE | Depends on Supabase "Confirm email" setting + your Resend template. Confirm the email actually arrives for a fresh address. |
| 3 | Login | PASS (code) | `doLogin()` → `enterApp()`/`boot()`. |
| 4 | Forgot password | **FAIL** | No forgot-password UI or `resetPasswordForEmail` anywhere. Email/password users who forget can't recover. Decision needed (see below). |
| 5 | Complete onboarding — position player | PASS (code) | 5 steps → `finishOnboarding()`. Simulated new SS scores 62 (metrics found). |
| 5b | Complete onboarding — pitcher | PASS (code) | ピッチャーストレート球速 field now appears for P; simulated new P scores 60 (fastball found). |
| 6 | Edit profile | PASS (code) | `renderProfileEdit` → `upsertPlayerRow()`. |
| 7 | Enter metrics | PASS (code) | `addMetric()` uses canonical `metric_key` from `metric_definitions`; **now busts the match cache** so マッチング率 updates immediately (bug fixed this pass). |
| 8 | Complete School Match Survey | PASS (code) | `setFitPref` → `persistFitPrefs` (players.preferences) → feeds `buildRecruitingFitProfile`. Lives in リクルーティング分析 → 適性診断 (UX note, not a break). |
| 9 | Browse schools | PASS (code) | `renderColleges` / `filteredColleges` (colleges data imported). |
| 10 | Search schools | PASS (code) | `S.cSearch` filter (name/city/state). |
| 11 | Sort by マッチング率 | PASS (code) | `sortColleges` / `COLLEGE_SORT` (high/low). |
| 12 | Save school | PASS (code) | `saveCollege()` → `dbInsert('saved_colleges')`. Note: auto-switches to 保存した大学 tab (P1-3 friction, not a break). |
| 13 | Remove saved school | PASS (code) — **depends on migration** | `deleteSavedCollege()` → `dbDelete` by `id`. Requires `fix_saved_colleges_id.sql` to have been applied (adds the `id` column). Confirm it ran. |
| 14 | School Hub | PASS (code) — **depends on migration** | `openHub()` → `renderCollegeDetail`. Stage buttons / rating / notes on saved schools also need `saved_colleges.id` (same migration). |
| 15 | Recruiting Analysis | PASS (code) | `renderFitSurvey` (レベル適性 / 適性診断 / 現在地). Reads `computeMatch` output. |
| 16 | AI Recruiting Assistant | PASS (code) + previously live-confirmed | `assistantSend` → `functions.invoke('recruiting-assistant')`. Edge function deployed; produced a real answer in earlier testing. |
| 17 | Share profile | NEEDS-LIVE | `publishProfile()` → `public_profiles` + `get_public_profile` RPC. Coach mode now redacts target schools. Verify the public link opens for a coach and shows no 志望校. |
| 18 | Resume / PDF export | PASS (code) | `printResume()` opens a print window of the same sheet. Caveat: browser pop-up blocker must allow it (handled with a toast if blocked). |
| 19 | Logout | PASS (code) | `doLogout()` → `BAP.signOut()` + state reset → welcome. |
| 20 | Login again + data persistence | NEEDS-LIVE | `boot()` validates the session via `auth.getUser()` then `loadPlayerData()`. Verify live: log out, log back in next day, nothing lost. |
| — | Mobile layout (iPhone + Android widths) | NEEDS-LIVE (device) | App is mobile-first (flex/grid, max-widths, no `position:fixed`). Check on real devices: keyboard overlap on onboarding inputs, safe-area insets, and the long 送付用（コーチ・大学）tab label. |

---

## Blockers / decisions before launch

1. **Forgot password (workflow #4) is missing.** This is the one true FAIL. Options:
   - Add a minimal, contained flow: a "パスワードをお忘れですか？" link on the login screen → `BAP.client.auth.resetPasswordForEmail(email)` → confirmation toast. Small and self-contained (not UX/feature creep). Recommend adding before launch.
   - Or accept for v1 if most users sign in with Google, and add it fast-follow. Your call.

2. **Confirm the earlier migrations ran** (workflows #13, #14 depend on them):
   - `fix_saved_colleges_id.sql` (adds `saved_colleges.id`)
   - `fix_document_status.sql` (書類 buttons)
   You ran `fix_onboarding_metric_keys.sql` today; please confirm these two are also applied in production Supabase.

3. **Live round-trips to run yourself (or via Claude in Chrome on localhost):**
   sign-up email arrival · share-profile public link (no 志望校 in coach mode) · log out → log back in persistence · real-device mobile layout.

---

## Fixes made during this verification pass (Launch Freeze — verified bugs only)
- **Onboarding metric seed** now writes canonical `metric_key` values + captures pitcher `fastball_velocity` (P0-1, P0-2).
- **Optimistic writes now bust the match cache**, so editing metrics refreshes マッチング率 immediately instead of a beat later (workflow #7).

No feature work, redesigns, or terminology changes were made — those stay parked until every workflow is confirmed PASS.
