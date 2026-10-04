# BAP School Identity Project

Not a "color project" — a **school identity** model. Each school eventually has one
complete identity record; color is a single field in it. The app already renders a
deterministic fallback for every school, so official data only *improves fidelity*
where present — nothing is ever broken while the identity fills in.

## The identity record

| Field | Lives in | Status today | Notes |
|---|---|---|---|
| Name | `colleges.name` | ✅ all 1,618 | — |
| Division | `colleges.division` | ✅ all | D1/D2/D3/NAIA/JUCO enum |
| Conference | `colleges.conference` | ✅ all | — |
| City / State | `colleges.city` / `state` | ✅ all | — |
| Head coach | `colleges.head_coach` | ✅ most | from import |
| Athletics URL | `colleges.athletic_website` | ✅ most | from import |
| Baseball URL | `colleges.source_url` | ◑ proxy | recruit-page link; real baseball URL is a later refinement |
| Nickname | `colleges.nickname` | ⛔ collect | e.g. "Tigers" — for richer copy |
| Primary color | media-library / `colleges.primary_color` | ◑ 260 D1 | **factual metadata**, no license needed; fallback covers the rest |
| Secondary color | media-library / `colleges.secondary_color` | ◑ 260 D1 | same |
| Logo | media-library / `colleges.logo_url` | ⛔ collect | licensed/official only — the copyright-sensitive field |
| Campus image | media-library / `colleges.campus_image` | ⛔ collect | Tier 2, licensed |
| Field image | media-library / `colleges.field_image` | ⛔ collect | Tier 2, licensed |
| Recruiting personality | (new) `colleges.personality` | ⛔ author | short factual tags — see below |

Legend: ✅ have · ◑ partial · ⛔ to collect.

The app resolves all of this through one layer (`schoolIdentity()`), so populating
any field anywhere makes it appear everywhere that school shows up.

## The schema is FROZEN

We are at the right complexity ceiling. **No new identity fields.** The work from here
is completeness and consistency, not more model. If a new field seems necessary, it
almost certainly belongs in the behavioral layer (below), not the identity record.

## Three layers (keep them conceptually separate)

- **A. Immutable factual (ground truth):** name, division, conference, location,
  athletics URL, colors (hex), logo, campus image, field image, coaches (as entities).
  This is the *identity graph*.
- **B. Semi-stable descriptors (observed truth / editorial):** nickname, recruiting
  personality tags, program-style tags (turf, roster size, climate). Curated and
  factual-ish, not strictly authoritative.
- **C. Behavioral (the real moat):** coach replies, follow-up timing, stage
  progression, blocked status, next-action engine. The *living system* — already built.

Because A/B are separated from C, experience upgrades never touch logic: add a logo and
every card/header improves; add colors and every accent improves — automatically.

## Source of truth — per field (attached to every field)

Each identity field carries its provenance, so data can be upgraded later without
ambiguity ("why is this color here?"):

- `official_source` — from the import or curated media
- `user_curated` — authored (nickname / personality tags)
- `fallback_deterministic` — the monogram/color derived from the name (never "missing")
- `missing` — no data and no meaningful fallback (logos, photos)

This is computed for every school in `build_coverage.py` and shown as colored dots in
the coverage dashboard.

## Fill order — usage-weighted, not taxonomy

You never need all 1,618 to feel premium. Prioritize by impact per session, not by level:

- **Tier 1 — impact per session:** most-viewed schools, most-saved schools, top D1
  baseball programs. (colors: ~260 D1 done)
- **Tier 2 — decision-heavy:** schools with coaches actively contacting users, and any
  school a user has in an offer/decision stage.
- **Tier 3 — long tail:** remaining D1, then D2 / JUCO / NAIA, then the rest (the
  deterministic fallback carries these indefinitely).

A few hundred usage-weighted identities covers the large majority of sessions.

## Identity Priority Score (what to fix next, not just what's missing)

Coverage answers "what's missing." Priority answers "what to fix next for maximum
product improvement." Per school:

- `+5` saved by users · `+5` active coach communication · `+3` in offer/decision stage
- `+2` frequently viewed · `+1` D1 baseball

**Impact = priority × visual gaps** (missing colors/logo/campus/field). The dashboard's
"Fix next" view sorts by impact, so a saved school in an offer stage with no visuals
rises to the top while an unviewed D3 with the same missing fields stays low.

Behavioral signals come from the live DB via an optional `school_signals.csv`
(columns: `school_name, saved, active_coach, offer_decision, viewed`). Without it,
priority reflects only baseball relevance (+1 D1) — still useful, just not usage-weighted.
Export the CSV periodically and re-run `build_coverage.py` to keep the ranking current.

## On "100% colors"

Every school already *has* a color (the deterministic fallback) — so color coverage is
already 100% in the "never empty" sense. **Official** colors are 16% (D1) and can't reach
100% honestly: there is no free color dataset for D2/D3/NAIA/JUCO, and guessing them would
be fabrication that corrupts the provenance system (a wrong `official_source` is worse than
an honest `fallback_deterministic`). Official colors rise only as real sources are fed in,
in impact-ranked order — that's the point of the Priority Score.

## Coverage control panel (internal, not user-facing)

`coverage-dashboard.html` (data from `build_coverage.py` → `coverage-data.js`) is the
production control panel: per-field coverage %, a by-division breakdown, and a per-school
table with a completeness score and a provenance dot per field. Use it to decide what to
fill next; never ship it to users.

## Field sourcing rules (keep the clean/dirty line sharp)

- **Facts — compile freely** (no license): name, division, conference, nickname,
  colors, athletics/baseball URLs, head coach. Colors are factual metadata.
- **Copyrighted media — curate/license only**: logo, campus image, field image.
  Official brand pages (per their terms) or a licensed feed; host in your own bucket.
- **Recruiting personality — author from facts**, not opinion. Short, verifiable tags:
  e.g. `warm-weather`, `turf field`, `pitcher development`, `SSC contender`,
  `~35-man roster`. No fabricated scouting claims.

## Pipeline (already built)

- `school_identity_template.csv` — one row per school, all identity fields + a
  `priority_tier` column so you can work the order above.
- `build_media_library.py` — turns the curated CSV into `media-library.js`
  (colors/logos/images/nickname/conference/division), validating every row.
- `match_colors_to_bap.py` + `color_aliases.json` — bind external short-name
  datasets (e.g. team colors) to your full institution names, safely.
- `colleges.*` columns (`media_library.sql`) — for the fields that belong on the
  school record itself (nickname, colors, personality, images).

Facts flow through automatically; the only human steps are curating licensed media
and authoring personality tags.
