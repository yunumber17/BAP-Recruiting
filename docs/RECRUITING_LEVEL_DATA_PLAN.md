# recruiting_level — Real-Data Coverage Plan

Objective: assign every one of the ~1,618 schools a real, normalized `recruiting_level`
(0–100 baseball program strength), maximizing authoritative-data coverage and using the
division/conference estimator ONLY where no reliable public data exists. No fabricated
values. The scoring engine stays unchanged; only the data improves.

## What I need from you first (blocker)

I can't query your Supabase or match your exact school names from here. To proceed I need
ONE of these:

1. Run `audit_recruiting_level.sql` and paste the two result tables back, and then export
   the school list as CSV (`id, name, division, conference, state, recruiting_level`), or
2. Just export that CSV — I can compute the audit from it directly.

Everything below is the proposed approach so you can approve it before any data work.

## The 0–100 scale (anchors)

A single scale across all divisions, so a strong D2 can correctly outrank a weak D1:

| Score  | Meaning (baseball program strength)                              |
|--------|------------------------------------------------------------------|
| 95–99  | National-title contenders (e.g. LSU, Wake Forest, Vanderbilt)    |
| 85–94  | Strong D1 / regular regional hosts                               |
| 75–84  | Mid-major D1 / elite D2                                          |
| 65–74  | Average D1 / strong D2                                           |
| 55–64  | Lower D1 / average D2 / top NAIA & JUCO                          |
| 45–54  | Average D3 / mid NAIA & JUCO                                     |
| 30–44  | Lower D3 / NAIA / JUCO                                           |

## Sources per division (authoritative, public)

- **Division I** — NCAA RPI covers **all ~300 D1 programs** (official, updated yearly),
  plus D1Baseball / Baseball America Top 25 and preseason polls, conference strength, and
  recent MLB draft counts. → D1 can reach near-100% real coverage.
- **Division II** — NCAA D2 national + regional rankings, conference standings.
  Ranked/regionally-ranked teams get real values; the long tail may fall back.
- **JUCO** — NJCAA D1/D2/D3 baseball rankings + region results.
- **NAIA** — NAIA Coaches' Top 25 poll + conference standings.
- **Division III** — NCAA D3 national/regional rankings (only ~top 30–40 nationally are
  ranked); most D3 programs are unranked and will keep the estimator until better data.

## Honest coverage expectation

- D1: very high real coverage (RPI is comprehensive).
- D2 / NAIA / JUCO: partial — ranked programs get real values, unranked stay on estimator.
- D3: mostly estimator (little public per-program strength data exists).

This is the correct outcome of "maximize real data, fall back only when necessary" — not a
shortfall. Coverage improves over time as more data is added, with zero code changes.

## Execution phases (priority order)

1. **Audit** (this doc + `audit_recruiting_level.sql`) — establish the real vs fallback
   baseline by division. ← approve before proceeding.
2. **D1** — build normalized ratings from RPI + polls + draft history; deliver as a bulk
   `UPDATE` SQL keyed by school name/id, with the source noted per school.
3. **D2** then **JUCO/NAIA** — ranked programs from the sources above.
4. **D3** — the nationally/regionally ranked programs; rest remain on the estimator.
5. **Remainder** — leave on the estimator; revisit as new data appears.

Each phase ships as a reviewable SQL file (`update_recruiting_level_dN.sql`) so you can
verify every value and its source before running it. Nothing is guessed; if a school has
no source, it is explicitly left NULL (estimator).
