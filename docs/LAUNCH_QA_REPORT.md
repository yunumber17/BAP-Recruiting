# BAP Recruiting — Launch QA Report

Method: code-grounded walkthrough of all 12 first-time-athlete flows in `bap.html`
(I can't click the live localhost from here, so every finding cites the actual
function/line so it's verifiable and fixable). Report only — nothing implemented yet.

Severity: **P0** = launch blocker · **P1** = fix before launch · **P2** = nice-to-have.

---

## P0 — Launch blockers

### P0-1. Onboarding metrics never reach マッチング率 (core value prop breaks for every new user)
`finishOnboarding()` seeds the `performance_metrics` rows with the wrong `metric_key`:

```
['Throwing Velocity', d.throwing_velocity, 'mph'],
['60-Yard Dash',      d.sixty_time,        'sec'],
['Home to 1st',       d.home_to_first,     'sec'],
['Exit Velocity',     d.exit_velocity,     'mph'],
… metric_key: m[0] …
```

But the scoring engine reads keys `throwing_velocity`, `sixty_yard`, `home_to_first`,
`exit_velocity` (via `DIVISION_BENCH.athletic[key]` / `perfMetricValue`). Because the
seeded keys are English display labels — and the 60-yard is stored as `sixty_time`
(engine reads `sixty_yard`) — none of the onboarding metrics are found by the athletic
evaluation.

Impact: a brand-new athlete completes onboarding, enters real numbers, and still gets
**no athletic score → マッチング率 shows 情報不足 / low, and 適性診断 shows 競技データ未登録**.
The metrics tab also shows raw English labels ("Throwing Velocity") instead of the proper
Japanese metric names. This defeats the entire fit feature on first run.

Fix location: `finishOnboarding()` metric seed — use the real keys
(`throwing_velocity` / `sixty_yard` / `home_to_first` / `exit_velocity`) as `metric_key`.
Also rename the onboarding field `sixty_time` → `sixty_yard` (step 3) so it matches.

### P0-2. Pitchers can't enter their primary metric during onboarding
Onboarding step 3 only captures `throwing_velocity` (fielder throw). The engine weights
`fastball_velocity` at 0.70 for pitchers (`POSITION_WEIGHTS.pitcher`). A pitcher finishes
setup with no fastball velocity, so their athletic score is empty/low regardless of talent.

Fix: when a pitcher position (P) is selected in step 2, show a ピッチャーストレート球速 field
in step 3 that saves to `fastball_velocity`.

---

## P1 — Fix before launch

### P1-1. Two different "fit" vocabularies shown to users
- College list + School Hub show マッチング率 bands: 最高のフィット / 好フィット / 良いフィット /
  要検討 / フィット低め / 相性は低い.
- リクルーティング分析 → 適性診断 shows a *different* scale: 高フィット / 中フィット / 成長フィット,
  with 競技/学業/好み bars instead of a %.

Same concept, two names and two visual systems. A first-time user sees "好フィット 82%" on
one screen and "中フィット" on another for the same school. Pick one system (recommend the
マッチング率 bands everywhere) so the product reads as one coherent idea.

### P1-2. The School Match Survey isn't part of the first session
The preference survey (地域 / 規模 / 選抜度 / 気候 / 費用 / 優先度) lives inside
リクルーティング分析 → 適性診断 (`renderFitSurvey`), not in onboarding. A new athlete never
sees it, so `personalFit` stays null and recommendations feel generic. This is the "finish
the survey" item: surface it as a real step (end of onboarding or a prominent home CTA) with
a completion moment — "あなたのリクルーティング・プロフィールが完成しました" — that visibly changes
マッチング率.

### P1-3. Saving a school yanks you out of search
`saveCollege()` sets `S.collegeView='saved'` and re-renders, so tapping 保存 in 大学検索
jumps the user to the 保存した大学 tab and loses their scroll position in the results.
Discourages saving several while browsing. Should save in place (button flips to 保存済み +
a toast), staying on the search list.

### P1-4. Metric label inconsistency (onboarding vs profile)
Onboarding step 3 labels the throw field "球速 / スローイング (mph)"; the profile/metrics use
the renamed 野手送球球速. The fastball metric is ピッチャーストレート球速 in the profile but has no
field in onboarding (see P0-2). Align the onboarding labels to the profile terms.

### P1-5. Grad-year term drift
Home shows 高校卒業年 (recently changed); onboarding step 1 select is labeled 高校卒業年度
with placeholder 卒業年度を選択. Same field, two labels. Unify to 高校卒業年.

---

## P2 — Nice-to-have (mostly the copy pass)

- **P2-1. Save-button copy varies:** 保存する / 大学を保存 / 保存済み across screens. Unify
  (e.g., マイスクールに追加 / 追加済み) in the copy pass.
- **P2-2. Logout has no confirmation:** the ログアウト link in onboarding/setup logs out on a
  single tap with no confirm — easy to hit by accident.
- **P2-3. Terse empty states:** several read just "ありません。". Turn each into a one-line
  "what to do next" (e.g., saved-schools empty → "保存した大学で相性を比較し、コーチとのやり取りを
  管理できます").
- **P2-4. Two "志望校" concepts:** onboarding step 5 free-text 志望校 (`target_schools`) is
  separate from saved schools in 大学検索, so what a user types there never appears in
  保存した大学. Either link them or rename one to avoid confusion.

---

## Couldn't verify from code (needs the live app / a device)
These are genuinely runtime/device concerns — flagging so they're not skipped:

- **Mobile layout on a real phone:** the app is mobile-first (flex/grid, max-widths, no fixed
  positioning found), but real-device checks are still needed for keyboard overlap on the
  onboarding inputs, safe-area insets, and the long 送付用（コーチ・大学）tab label wrapping.
- **Performance of the 1,618-college list:** rendering is paged and the catalog is cached, and
  taps are optimistic — no red flags in code — but scroll smoothness with the full list and
  sort/filter on a mid-range phone should be checked live.
- **Full round-trip flows:** signup email confirmation, returning next day (session restore),
  edit/delete, log out → log back in. The code paths exist and look correct (`boot()` validates
  the session via `auth.getUser()`), but end-to-end confirmation needs the running app.

---

## Suggested fix order
1. **P0-1 and P0-2** — without these the fit score (the product's whole point) is broken for
   new users. Highest priority by far.
2. **P1-1 (unify fit vocabulary)** and **P1-3 (save in place)** — biggest clarity/friction wins.
3. **P1-2 (survey in the flow)** — overlaps with the "finish the survey" task; do together.
4. **P1-4 / P1-5** label alignment.
5. **P2** items in the copy pass.

Then the live "first-time user" walkthrough (signup → return next day → log out/in) to catch
what static analysis can't.
