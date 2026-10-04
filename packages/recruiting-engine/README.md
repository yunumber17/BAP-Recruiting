# @bap/recruiting-engine

Recruiting Score Engine for the BAP college baseball recruiting platform.
Given a **player** and a **school**, it returns a 0–100 `RecruitingScore` with a
letter grade, confidence, a Reach / Target / Safety classification, and a
seven-part breakdown — all fully typed, deterministic, and dependency-free.

```
npm install
npm test          # 29 unit tests (vitest)
npm run typecheck # strict tsc, no emit
npx tsx example.ts
```

## Usage

```ts
import { RecruitingScoreEngine, type Player, type School } from '@bap/recruiting-engine';

const engine = new RecruitingScoreEngine();          // or pass a config override
const result = engine.score(player, school);

result.overall;          // 0–100 (weighted)
result.grade;            // 'A+' … 'F'
result.confidence;       // 0–100 (data completeness)
result.classification;   // 'Reach' | 'Target' | 'Safety'
result.breakdown;        // seven ComponentScores
result.summary;          // human-readable JP guidance

engine.rank(player, schools); // schools sorted best-fit first
```

## The seven components

| Component | What it measures |
|---|---|
| **Athletic Fit** | Position-specific measurables vs the division benchmark (velo, exit velo, 60, pop time, arm). Heaviest component. |
| **Academic Fit** | GPA + SAT/ACT vs the school's requirements and average student. Hard-gates below minimums. |
| **Roster Opportunity** | Does the school recruit this position; class/roster room. |
| **Scholarship Potential** | Athletic-aid likelihood, gated by division (D3 = none) and scaled by how far the player beats the bar. |
| **Geographic Fit** | Region preference, distance (when coords given), affordability. |
| **Coach Match** | Alignment with declared coach preferences (position, handedness, metric thresholds, academic emphasis). |
| **Development Potential** | Upside: class year, projectable frame, "close to the bar", showcase/award exposure. |

## How scoring works

- **Benchmarks** (`src/benchmarks.ts`) hold per-division, per-position metric
  anchors as `{ floor → 50, good → 90 }`. `scaleMetric` maps a measurable onto
  0–100 and auto-handles lower-is-better metrics (60-yard dash, pop time).
- **Division awareness**: the engine shifts weight between Athletic and Academic
  fit by division (`ACADEMIC_EMPHASIS`) — D3 leans academic, D1 leans athletic —
  keeping their combined weight constant.
- **Overall** is the weighted mean of the seven components; **grade** comes from
  `letterGrade`; **confidence** is the weight-blended completeness of the inputs
  each component could actually use.
- **Classification** is derived from the athletic+academic *fit* blend
  (can they play, can they get in), with configurable thresholds.
- **Missing data never throws** — it lowers confidence and adds a note.

## Configuration

```ts
new RecruitingScoreEngine({
  weights: { athleticFit: 0.35, academicFit: 0.15 /* … */ },
  classification: { safety: 72, target: 55 },
  lowConfidenceThreshold: 55,
});
```

## Layout

```
src/
  types.ts            all interfaces + unions (Player, School, RecruitingScore, config)
  benchmarks.ts       division/position anchors, academic emphasis, aid eligibility
  config.ts           default weights + config resolution
  util.ts             scaleMetric, weightedMean, letterGrade, haversine, regionForState
  scoring/            one pure module per component
  engine.ts           RecruitingScoreEngine (score, rank) + scoreRecruit
  index.ts            public API
test/
  fixtures.ts         sample players + schools
  engine.test.ts      end-to-end behavior, ranking, classification, confidence, config
  scoring.test.ts     per-module + util unit tests
```

## Integrating with the BAP app

The engine is pure TypeScript with no runtime deps, so it can:
- run server-side (Supabase Edge Function / Node API) to precompute
  `player_scores`, or
- be bundled to JS and run client-side inside `bap.html`.

Map the app's `players` row and a `colleges` row onto `Player` / `School`,
call `engine.score(...)`, and store `overall` + `breakdown` into `player_scores`
so the 進捗 tab renders real numbers.
```
```
