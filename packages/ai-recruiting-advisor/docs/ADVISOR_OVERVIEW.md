# Advisor Overview

Every advisor shares the base output (summary, recommendations[priority,
confidence], actionItems, risks, followUpQuestions, facts[certainty], confidence)
and adds specifics where noted. All are registered in `AdvisorService`.

| Advisor | Kind | Required context | Extra output |
|---|---|---|---|
| Player Development | `player-development` | profile, metrics | — |
| Recruiting Strategy | `recruiting-strategy` | profile, metrics, scores, schools, contacts | — |
| Academic | `academic` | profile | — |
| Email | `email` | profile, metrics | `email{subject,body,kind}`, `variables[]` |
| Mental Performance | `mental-performance` | profile | — |
| Parent | `parent` | profile | — |
| Coach Communication | `coach-communication` | profile, contacts | — |
| Timeline | `timeline` | profile, timeline, tasks | `phases[freshman…senior]{current,items}` |
| Profile | `profile` | profile, metrics, videos | — |
| Video Review | `video-review` | profile, videos | — |
| Goal Planning | `goal-planning` | profile, metrics, tasks | `goals[SMART]` |
| Interview | `interview` | profile | — |
| Scholarship | `scholarship` | profile, scores, schools | — |

## Example — "What should I improve?" (player-development)
Returns:
- `summary` — the single highest-leverage theme
- `recommendations[]` — each with detail, `priority`, `estimatedImpact`, `confidence`
- `actionItems[]` — concrete next steps with `dueHint`
- `risks[]` — e.g. overtraining
- `followUpQuestions[]` — to refine the plan
- `facts[]` — benchmark claims labeled known/likely/unknown
- `confidence` — overall

## Email advisor
Produces an **editable** structured email (`subject`, `body`, `kind` ∈
initial/followup/camp/thankyou/update) plus `variables[]` (the placeholders the
player personalizes). The player edits before sending — the advisor never sends.

## Goal Planning
Emits SMART `goals[]` (specific, metric, current, target, unit, dueHint,
nextMilestone). Progress tracking updates `current` over time; the advisor
suggests the next milestone.

## Timeline
Emits `phases[]` (freshman→senior) with the player's `current` phase flagged.
NCAA contact/eligibility dates are deliberately left as `facts` with certainty
`unknown` until the college data + rules source are connected.

## Adding an advisor
1. Add the kind to `ADVISOR_KINDS`.
2. Add a `PromptTemplate` to `PROMPT_TEMPLATES` (system/developer/output/few-shot).
3. Add an output schema to `OUTPUT_SCHEMAS` (extend `BaseAdvice`).
The DI container auto-registers it; no engine changes.
