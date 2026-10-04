# Context Engine

The Context Engine turns a `playerId` into a typed `PlayerContext` for prompts.
Advisors declare which **slices** they need; the builder fetches only those.

## Providers (interfaces — mocked today)
`ContextProviders` bundles one provider per domain:

| Slice | Provider | Real source (later) |
|---|---|---|
| profile | `ProfileProvider` | Backend Services — Player |
| metrics | `MetricsProvider` | Backend Services — PlayerMetric |
| scores | `ScoresProvider` | **Recruiting Score Engine** (via backend) |
| schools | `SchoolsProvider` | Backend Services — SavedSchool + Schools table |
| timeline | `TimelineProvider` | Timeline engine / tasks |
| tasks | `TasksProvider` | Backend Services — Task |
| contacts | `CoachContactsProvider` | Backend Services — CoachContact |
| videos | `VideosProvider` | Backend Services — Video |

Today these are `createMockContextProviders()` with realistic sample data.
`scores` and `schools` return empty (engine + college DB not wired), and advisors
handle that gracefully (they say a personalized fit list improves once connected).

## ContextBuilder
```ts
const ctx = await contextBuilder.build(playerId, ['profile', 'metrics']);
```
- Fetches requested slices **in parallel**.
- **Degrades gracefully**: a throwing provider logs a warning and omits its slice
  rather than failing the advisor.
- **Caches** per `(playerId, slices)` for the life of the builder instance.

## Swapping to real data (no advisor change)
Implement each provider interface as an adapter over the backend service layer
(or the score engine), then pass them to the container:
```ts
createAdvisorContainer({
  contextProviders: {
    profile:  { getProfile:  (id) => backend.players.getById(id).then(toProfileData) },
    metrics:  { getMetrics:  (id) => backend.metrics.listByPlayer(id) },
    scores:   { getScores:   (id) => backend.recruiting.listForPlayer(id, sys) },
    // …
  },
});
```
Because advisors depend only on the `ContextProviders` interface, this is a DI
change — no prompt, advisor, or schema edits.

## Context serialization
`renderPrompt` serializes only present, non-empty slices into the user message
under "Player context (authoritative; do not invent beyond this)", keeping the
model grounded and tokens low.
