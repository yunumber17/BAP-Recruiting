# BAP Recruiting — Ballers Across Pacific

A decision-support platform for Japanese high-school baseball players entering U.S. college recruiting. The app is entirely in Japanese. It scores all 1,618 U.S. college baseball programs for an individual player, ranks college camps by percentile, drafts coach emails in English, and answers recruiting questions from the player's own data.

**Live:** iOS App Store (BAP Recruiting) · Web: https://app.ballersacrosspacific.com
**Author:** Yu Suefuji · Founder, product design, data, security, go-to-market.

This repository is the codebase submitted with my MIT Maker Portfolio. A working demonstration (2-minute screen recording of the live app) is included in the portfolio.

---

## What it does

- **School Match** — every one of 1,618 programs is scored for the player with a weighted multi-criteria model and labeled 挑戦校 (reach) / 現実校 (target) / 安全校 (safety), sorted by fit rather than fame.
- **Prospect Camps** — college camps are scored by the same engine and ranked by *percentile* across all upcoming camps, so five stars is reserved for the top band.
- **AI Recruiting Assistant** — answers questions in Japanese using the player's actual profile as context. Inference runs server-side; the model key never reaches the client.
- **Coach outreach + email drafting** — tracks every coach conversation and drafts formal English emails from the player's own stats.
- **Readiness score, daily focus, daily baseball English.**

## How fit is scored

Fit is a *utility function, not a ladder*. Baseball fit is a bell curve over the gap between the player's rating and a program's level; the best fit is the closest match, and a reach is penalized slightly more than being over-qualified. Four signals are weighted (baseball fit 40 %, academic fit 25 %, coach interest 20 %, preference fit 15 %); a signal with no data drops out and the rest renormalize. The output is a fit tier with a plain-language reason, never an admission probability. See `baseballFit()`, `_estimateRecruitingLevel()`, `campRawValue()` and `campRankIndex()` in `app/bap.html`.

## Repository layout

```
app/        bap.html (the application), focus-library.js, baseball-english-library.js,
            privacy-policy.html, terms.html
            + config.js, auth.js  (see "Running it")
data/       colleges_demo.js (1,618-program catalog), camps_raw.txt → parse_camps.py →
            camps.csv / camps.json, college_stats.json
db/         camps_no_id.sql (production load of 425 camps), bap-security-fixes.sql
supabase/   edge functions: recruiting-assistant, delete-account
tools/      seed.js (offline demo state), capture.py / capture65.py (headless App Store captures)
```

## Architecture

One codebase, two platforms, one backend.

- **Clients:** a native iOS app (Capacitor shell around `app/bap.html`, Sign in with Apple, push notifications) and the same UI served on the web for Android and any browser.
- **Backend:** Supabase — Postgres, Auth, Edge Functions. Row-level security is enforced on every table so a user can only reach their own rows.
- **Model inference:** the `recruiting-assistant` edge function receives the question plus the player's profile as context and calls the model server-side. Spend limits cap the cost of abuse.

## Data

- `data/colleges_demo.js` — 1,618 programs (49 states + DC, 177 conferences) with division, conference, tuition, net cost, acceptance rate, roster size, scholarship and international-friendly flags.
- `data/parse_camps.py` — parses raw camp listings (`camps_raw.txt`), normalizes dates, splits city/state, extracts the conference, de-duplicates same-school-same-date entries. Last run: 430 raw → 5 duplicates removed → 425 loaded, 0 unparsed. The app hides past dates, so the live count falls over the season.
- `db/camps_no_id.sql` — the production insert.

## Security

Audited with Supabase's Security Advisor. `db/bap-security-fixes.sql` revokes public `EXECUTE` on internal functions, pins a mutable `search_path`, and verifies the public waitlist is insert-only (signups can't be read back). Result: 0 errors; 12 warnings reduced to 2 documented, intentional exceptions (`get_public_profile` for share-by-link, and the `pg_trgm` extension location).

## Running it

1. Copy `config.js` and `auth.js` into `app/` (they hold the Supabase project URL and the **public anon key** only; the service-role key is never shipped).
2. Serve `app/` with any static server, e.g. `python3 -m http.server 8000`, and open `http://localhost:8000/bap.html`.
3. The database schema, RLS policies and edge functions live in the Supabase project; the SQL in `db/` and the function sources in `supabase/` document them.

`tools/seed.js` injects a realistic demo athlete and loads the catalog offline; `tools/capture.py` renders the seven App Store screenshots from the live UI with headless Chromium.

## How it was built, and AI assistance

I built BAP solo. I conceived the product, defined the problem, designed the matching philosophy and its weights, built and loaded the data, ran the security audit, managed the App Store submission, and made every product decision.

For implementation I used **Claude (Anthropic)** as an AI coding assistant throughout. I specified features, data models and rules; it drafted and refactored JavaScript, Python and SQL to my requirements, and I reviewed the code, tested on device, ran the database migrations, and decided what shipped. Concretely it helped write the matching and ranking functions I designed, the camp-listing parser, the SQL loads and security fixes, the screenshot tooling, and the layout generators for my portfolio. The product concept, fit philosophy, weighting, data strategy, security policy and go-to-market decisions are mine.

Platforms and libraries: Supabase (Postgres, Auth, Edge Functions, Security Advisor), Capacitor, Xcode, OpenAI API (assistant inference, server-side), Playwright, pptxgenjs.

## Limitations

- Program strength is estimated from division, conference, selectivity and roster size when a true recruiting level isn't available. The estimator is isolated (`_estimateRecruitingLevel`) so real data can replace it without touching the scoring.
- Scoring weights were set by judgment; outcome data (where players committed, how they fared) doesn't yet exist at scale to calibrate them.
- Camp records carry host school, date, division and location, not yet cost or coach counts.

---

© Yu Suefuji. All rights reserved. Shared for portfolio review.
