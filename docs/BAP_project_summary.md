# BAP (Ballers Across Pacific) — Project Summary

## Product
BAP is a **Japanese-first college baseball recruiting platform** for Japanese high-school players who want to play baseball at U.S. colleges. It answers the questions a Japanese family can't easily answer on their own: *Which schools fit me? Am I good enough? What should I do next? Which camps are worth flying to and spending money on?* Everything is grounded in the player's real data and written in natural Japanese.

## Tech stack & architecture
- **Frontend:** a single self-contained file, `bap.html` — vanilla HTML/CSS/JS single-page app (no framework). Japanese-first UI, mobile-style layout, navy `#1B2D4E` + blue `#0A67C7` design system.
- **Backend:** **Supabase** (Postgres + Auth + Row-Level Security). The app reads/writes directly via the Supabase JS client. Auth supports email/password **and Google sign-in**.
- **Single source of truth:** all data lives in Supabase and loads into one in-memory object (`BAP_STATE`) on login. Every screen reads from it; every write refetches it, so all features stay consistent.
- **Design principle:** deterministic, explainable logic only. No fabricated data — if something is missing, the UI says so (情報不足) rather than inventing values.
- **Separate TypeScript packages** were also built (Recruiting Score Engine, Prisma DB schema, Backend Service Layer, School Import Pipeline, AI Recruiting Advisor, School-Import Verification). These are production-grade, tested modules that are **not yet wired into the live app** — they need an API layer to run. The live app currently uses lighter deterministic, in-browser equivalents of their ideas.

## Data assets (in Supabase)
- **1,618 U.S. colleges** — scraped, profiled, validated, imported, and "locked" as the production source of truth (identity/location/division/conference/academics/financials/roster). UUID primary keys.
- **`metric_definitions`** — catalog of allowed performance metrics (球速, 60ヤード走, exit velo, etc.) with JP/EN labels and units.
- **215 prospect camps** — parsed from a flatground.org camp list into a public `camps` table (host school, date, city/state, division).
- Player-owned tables: players, tasks, coach_contacts, coach_messages, performance_metrics, improvement_goals, videos, saved_colleges, favorite_colleges — all protected by RLS on `auth.uid()`.

## Features built (in the live app)
**Onboarding & profile**
- Multi-step onboarding collecting full recruiting stats (positions, height/weight, velo, 60 time, exit velo, GPA, SAT/ACT, TOEFL, target division/schools, coach reference).
- Profile with editable fields incl. GPA/SAT/ACT/TOEFL; tabs for 指標 (metrics), 動画 (video links), 目標 (goals), 書類 (docs), 英語 (recruiting vocabulary). Metrics dropdown reads from the `metric_definitions` catalog; video links save to the `videos` table.

**Home dashboard (guided, not a data dump)**
- 今週のリクルーティングレポート card, AIリクルーティングアドバイザー card, リクルーティングロードマップ card, readiness panel, 志望校 summary, コーチ summary, activity feed, tasks.
- Recruiting **status** chip (準備中 → 志望校選定中 → コーチ連絡中).

**College Match Score & explainability**
- Real weighted match score per school: **academic ~ athletic ~ recruiting**, with school-specific academic *alignment* (a strong student best-matches strong-academic schools, not the easiest ones).
- 「このスコアの理由」 (factor breakdown: value vs benchmark vs status), 「スコアを改善するには」 (top-3 impact), 信頼度 (High/Medium/Low), Reach/Target/Safety labels (挑戦校/現実校/安全校).

**College Explorer (大学検索)** — search/filter all 1,618 schools by division/region/state; rich detail pages.

**Division Analysis (レベル適性)** — per-division fit (D1–JUCO) from the player's metrics/academics vs guideline benchmarks, with horizontal bars.

**Dynamic Recruiting Roadmap** — a living plan (プロフィール → 学力 → 競技力 → 動画 → 大学リスト → コーチ連絡 → 出願) that auto-updates from the player's data; target-level selector; class-year awareness; one recommended priority.

**Weekly Recruiting Report** — genuine week-over-week deltas (readiness %, avg match %) computed with **no stored snapshots** by reconstructing "state 7 days ago" from row timestamps; this-week activity, warnings, and the single biggest improvement opportunity with projected impact.

**AI Recruiting Advisor** — rule-based "coach summary" card: 現在の状況 / 今日やるべきこと / 注意点, plus a division "level-fit" analysis. (Deterministic, grounded in real data — branded "AI" but not an LLM.)

**School Strategy (志望校戦略)** — analyzes only *saved* schools: overview (count, avg/max/min match), shared gap analysis ("この改善は◯校で効果があります"), per-school strengths/weaknesses/next action, and a recommended timeline.

**AI Email Assistant** — inside each coach contact: 5 email types (初回/フォローアップ/キャンプ問い合わせ/お礼/アップデート), personalized in English from real profile data (never fabricates), a Japanese "why this structure" note, attachment suggestions, copy, and save-draft-to-timeline (never claims to send).

**Prospect Camp Finder (プロスペクトキャンプ)** — a primary nav tab. For all 215 camps: date/location/division, a **relative BAP recommendation** (percentile-ranked across all camps → star bands, only ~top 8% are ★★★★★), a 0–100 value, 「なぜこの評価なのか」, 「参加すると期待できること」, saved-school highlighting, an investment/ROI verdict, and a **BAPおすすめ順** sort so families instantly see the highest-ROI camps. Past camps hidden by default.

## What we're working on right now
Just finished the **Prospect Camp Finder** and refined its recommendation engine:
- Converted camp ratings from an *absolute* score to a **relative percentile ranking** across all 215 camps (stars = bands: ~top 8% = 5★, next ~17% = 4★, middle ~45% = 3★, etc.), with a 0–100 number driving the sort.
- Fixed a timing bug where same-day camps were mis-scored as "past"; camp timing is now calendar-date based and past camps are hidden by default.

## Known limitations / honest notes
- The standalone TypeScript packages (score engine, AI advisor as a real LLM, recommendation engine) are **not powering the live app** — that needs a small API layer. The app uses deterministic in-browser equivalents today.
- Athletic/academic benchmarks are reasonable **guideline estimates**, clearly labeled 目安; not official cutoffs.
- The 215 camps are **single-school host camps** with limited fields (no cost/coaches count/website/deadline in the source) — shown as "—".
- School-name matching between camps and the college DB is fuzzy (substring), so a few camps may not link to a saved school.
- The weekly report can't diff profile-field changes (GPA/height) because there's no per-field history; only timestamped tables drive deltas.
- Multi-device: some client-only ideas (e.g., profile snapshots) would be per-browser.

## Future steps (roadmap)
1. **Save/track camps** (like saved colleges) + camp reminders and coach follow-up nudges via the existing tasks.
2. **Real LLM advisor / email polish** via a small API endpoint that the existing AI Advisor package sits behind (keeps everything grounded in the player's data).
3. **Enrich camp data** — cost, coaches count, registration deadline, website, and true multi-school showcases (the recommendation logic already supports it).
4. **Per-school recruiting plan** — tie the roadmap specifically to the saved schools ("to be competitive for your 5 saved schools, here's the month-by-month gap plan").
5. **Wire the 6 TS packages behind one API** (monorepo), so the app uses the full production intelligence instead of in-browser equivalents.
6. **Schema cleanup** — remove redundant alias columns; standardize on native column names.
7. **Monetization** — the camp finder + weekly report + strategy are the subscription-worthy "recruiting intelligence" layer that justifies recurring value.

## The core product thesis
Competitors (NCSA, SportsRecruits, FieldLevel) store data, let you contact coaches, or build a profile. BAP's differentiator is **recruiting intelligence**: it tells a Japanese family *which schools fit, whether the player is ready, what to improve, and where to actually spend their time and money* — turning a database into personalized, evidence-based recruiting decisions.
