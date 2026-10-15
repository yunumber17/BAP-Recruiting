# BAP Recruiting - Ballers Across Pacific

A decision-support platform for Japanese high-school baseball players entering U.S. college recruiting. The app is entirely in Japanese. It scores all 1,618 U.S. college baseball programs for an individual player, ranks college camps by percentile, drafts coach emails in English, and answers recruiting questions from the player's own data.

**Live:** iOS App Store (BAP Recruiting) · Web: https://app.ballersacrosspacific.com
**Author:** Yu Suefuji: founder, product design, scoring model, data, security, go-to-market.

This is the full codebase submitted with my MIT Maker Portfolio. A working demonstration (a 2-minute screen recording of the live app) is included in the portfolio.

---

## What it does

- **School Match** : every one of 1,618 programs is scored for the player with a weighted multi-criteria model and labeled 挑戦校 (reach) / 現実校 (target) / 安全校 (safety), sorted by fit rather than fame.
- **Prospect Camps** : college camps are scored by the same engine and ranked by *percentile* across all upcoming camps, so five stars is reserved for the top band.
- **AI Recruiting Assistant** : answers questions in Japanese using the player's actual profile as context. Inference runs server-side in an edge function; the model key never reaches the client.
- **Coach outreach + English email drafting** : tracks every coach conversation and drafts formal English emails from the player's own stats.
- **Readiness score, daily recruiting focus, daily baseball English, shareable profile card.**

## How fit is scored

Fit is a *utility function, not a ladder*. Baseball fit is a bell curve over the gap between the player's rating and a program's level: the best fit is the closest match, and a reach is penalized slightly more than being over-qualified. Four signals are weighted (baseball fit 40 %, academic fit 25 %, coach interest 20 %, preference fit 15 %); a signal with no data drops out and the rest renormalize. The output is a fit tier with a plain-language reason, never an admission probability.

In the shipped app see `baseballFit()`, `_estimateRecruitingLevel()`, `campRawValue()` and `campRankIndex()` in `app/bap.html`. A typed, tested implementation of the engine lives in `packages/recruiting-engine`.

## Repository map

```
app/                      The shipped web app: bap.html (single-file application), focus-library.js,
                          baseball-english-library.js, privacy-policy.html, terms.html, config.example.js
ios/BAPRecruiting/        Native SwiftUI prototype of the app (18 Swift files); ios/appicon/
supabase/functions/       Edge functions: recruiting-assistant (server-side LLM with player context,
                          daily limits), delete-account (account deletion)
packages/
  recruiting-engine/      Recruiting Score Engine (TypeScript): player × school → 0–100 score, grade,
                          confidence, Reach/Target/Safety, per-factor breakdown. Tests + benchmarks.
  school-importer/        Idempotent streaming ETL pipeline that populates the Schools table from
                          scraper output, with checkpoints and reports. Tests.
  school-import-verification/  The "database lock" gate: profiling, statistics, integrity checksums
                          and quality reports over the Schools dataset before other modules use it.
  backend-services/       Layered service layer (API → controllers → services → repositories → Prisma).
  bap-db/                 PostgreSQL data model in Prisma: normalized, UUID keys, soft deletes, audit
                          timestamps, ERD and migration docs.
  ai-recruiting-advisor/  Provider-agnostic AI service layer of specialized recruiting advisors with
                          a context engine, safety advisor, memory, and streaming structured outputs.
data/                     colleges_demo.js (1,618-program catalog), camps_raw.txt → parse_camps.py →
                          camps.csv / camps.json, college_stats.json
db/                       camps_no_id.sql (production load of 425 camps), bap-security-fixes.sql
tools/                    seed.js (offline demo state), capture.py / capture65.py (headless App Store
                          screenshot captures of the live UI)
docs/                     Engineering docs: RLS security audit, public-share XSS report (found and
                          fixed), 8-point security mapping, schema audit, launch QA report and
                          readiness checklists, data pipeline, assistant deploy guide, recruiting-level
                          data plan, school identity rules, project summary, vocabulary
```

Each package has its own README, tests (`vitest`) and docs.

## Architecture

- **Clients.** The production app is `app/bap.html`, served on the web and wrapped natively for iOS with Capacitor (Sign in with Apple, push notifications). It talks to Supabase through `supabase-js`.
- **Backend.** Supabase: Postgres, Auth, Edge Functions. Row-level security is enforced on every table so a user can only reach their own rows.
- **Model inference.** `supabase/functions/recruiting-assistant` receives the question plus the player's profile as context, enforces a per-user daily limit, and calls the model server-side (provider selectable by environment). Keys live only in function secrets.
- **Platform packages.** The TypeScript packages implement the scoring engine, the school data pipeline and its verification gate, the service layer, the Prisma data model, and the AI advisor layer, each with test suites and design docs.
- **Native prototype.** `ios/BAPRecruiting` is a SwiftUI implementation of the app's screens built during development.

## Data

- `data/colleges_demo.js` — 1,618 programs (49 states + DC, 177 conferences): division, conference, tuition, net cost, acceptance rate, roster size, scholarship and international-friendly flags.
- `data/parse_camps.py` — parses raw camp listings, normalizes dates, splits city/state, extracts the conference, de-duplicates same-school-same-date entries. Last run: 430 raw → 5 duplicates removed → 425 loaded, 0 unparsed. The app hides past dates, so the live count falls over the season.
- `packages/school-importer` and `packages/school-import-verification` — the pipeline and quality gate that produced and locked the Schools dataset.

## Security

- Audited with Supabase's Security Advisor; `db/bap-security-fixes.sql` revokes public `EXECUTE` on internal functions, pins a mutable `search_path`, and verifies the public waitlist is insert-only. Result: 0 errors; 12 warnings reduced to 2 documented, intentional exceptions.
- `docs/BAP_PUBLIC_SHARE_XSS_REPORT.md` documents a cross-user XSS vector I found in the public share page (three inconsistent escapers, unvalidated `href`s) and the fix: a single `escapeHtml` and `sanitizeUrl` applied everywhere the page renders user data.
- `docs/BAP_RLS_SECURITY_AUDIT.md` and `docs/BAP_SECURITY_8POINT_MAPPING.md` cover the row-level security policies and the App Store security review.

## Running it

**Web app.** Copy `app/config.example.js` to `app/config.js` and fill in the Supabase project URL and **public anon key**. The shipped bundle also includes `auth.js`, a thin wrapper that creates the client and exposes `BAP.client`, `signIn`, `signUp`, `signOut`, `getSession`, `onAuthChange` and `getPlayer`; both are deployment files kept out of this public repository. Then serve `app/` with any static server (`python3 -m http.server 8000`) and open `bap.html`.

**Edge functions.** See `docs/RECRUITING_ASSISTANT_DEPLOY.md`. Secrets (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`, `LLM_PROVIDER`, `MODEL_CHAT`, `ASSISTANT_DAILY_LIMIT`) are set with `supabase secrets set`, never committed.

**Packages.** Each is a standalone Node project: `npm install && npm test`. `packages/bap-db` needs a `DATABASE_URL` (see its `.env.example`).

`tools/seed.js` injects a realistic demo athlete and loads the catalog offline; `tools/capture.py` renders the App Store screenshots from the live UI with headless Chromium.

## How it was built, and AI assistance

I built BAP solo. I conceived the product, defined the problem, designed the matching philosophy and its weights, built and loaded the data, ran the security audits, managed the App Store submission, and made every product decision.

For implementation I used **Claude (Anthropic)** as an AI coding assistant throughout. I specified features, data models and rules; it drafted and refactored JavaScript, TypeScript, Swift, Python and SQL to my requirements, and I reviewed the code, tested on device, ran the database migrations, and decided what shipped. Concretely it helped write the matching and ranking functions I designed, the camp-listing parser, the SQL loads and security fixes, the screenshot tooling, the platform packages and their tests, and the layout generators for my portfolio. The product concept, fit philosophy, weighting, data strategy, security policy and go-to-market decisions are mine.

Platforms and libraries: Supabase (Postgres, Auth, Edge Functions, Security Advisor), Capacitor, Xcode/SwiftUI, Prisma, Vitest, OpenAI API (assistant inference, server-side), Playwright, pptxgenjs.

## Limitations

- Program strength is estimated from division, conference, selectivity and roster size when a true recruiting level isn't available. The estimator is isolated so real data can replace it without touching the scoring (`docs/RECRUITING_LEVEL_DATA_PLAN.md`).
- Scoring weights were set by judgment; outcome data (where players committed, how they fared) doesn't yet exist at scale to calibrate them.
- Camp records carry host school, date, division and location, not yet cost or coach counts.

---

© Yu Suefuji. All rights reserved. Shared for portfolio review.
