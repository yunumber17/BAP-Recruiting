# FUTURE_AI_INTEGRATION

Every connection below is an **adapter or a DI override** — no advisor, prompt,
schema, or engine code changes. The seams already exist.

## 1. Recruiting Score Engine
**Seams:** `ScoresProvider` (context) + `explainRecruitingScoreTool` (tool).
**Consumers:** Recruiting Strategy, Scholarship, Profile advisors.
**Wire:**
- [ ] Implement `ScoresProvider.getScores(playerId)` as an adapter that calls the
      backend's recruiting endpoint (which owns the engine), mapping to
      `RecruitingScoreData`.
- [ ] Implement `ExplainRecruitingScore.execute()` to load the stored
      `RecruitingScore.breakdown` and produce an explanation (it currently throws
      `NotIntegrated`).
- [ ] Pass the adapter via `createAdvisorContainer({ contextProviders: { scores } })`.
Advisors already handle empty scores; once populated they cite real fit numbers.

## 2. College Database
**Seams:** `SchoolsProvider` (context).
**Consumers:** Recruiting Strategy, Scholarship, Timeline advisors.
**Wire:**
- [ ] Implement `SchoolsProvider.getSavedSchools(playerId)` over the backend
      SavedSchool + Schools data (populated by the Import Pipeline).
- [ ] Inject via DI. Advisors switch from "general guidance" to school-specific.

## 3. Recommendation Engine
**Seam:** new `RecommendationAdvisor` (or enrich Recruiting Strategy).
**Wire:**
- [ ] Add a `RecommendationsProvider` interface + adapter over the backend's
      recommendation endpoint, and a `recommend-schools` advisor kind with its
      template + schema (`schools[]` with Reach/Target/Safety).
- [ ] No framework change — same `Advisor<T>` + registry pattern.

## 4. Player Dashboard (frontend `bap.html` / web app)
**Seam:** `AdvisorService` + the SSE/WebSocket adapters.
**Wire:**
- [ ] Expose `AdvisorService.ask` / `askStream` behind the backend API (an
      `/advisors/:kind` route), streaming via `streamToSse`.
- [ ] The 進捗 tab, coach-email flow, and goal/timeline views call the relevant
      advisor and render the structured output (recommendations, email object,
      goals, phases) directly.

## 5. Backend Services
**Seam:** every context provider + memory + a real `TokenVerifier`-gated route.
**Wire:**
- [ ] Back `ProfileProvider`, `MetricsProvider`, `TasksProvider`,
      `CoachContactsProvider`, `VideosProvider` with the backend repositories.
- [ ] Replace `InMemoryShortTermMemory` / `InMemoryLongTermMemory` with
      DB-backed implementations (conversation + player memory tables).
- [ ] Enforce ownership: only pass a `playerId` the caller is authorized for
      (backend `Policy`), before invoking the advisor.

## 6. Timeline Engine
**Seam:** `TimelineProvider` (context) — consumed by the Timeline advisor.
**Wire:**
- [ ] Implement `TimelineProvider.getTimeline(playerId)` from the timeline
      source (class-year phase + completion state).
- [ ] Feed real NCAA/contact dates into a `RulesProvider` (future) so the
      Timeline/Parent/Scholarship advisors can cite them as `certainty: "known"`
      with a verified source instead of `unknown`.

## 7. Import Pipeline
**Indirect.** The pipeline populates the Schools table; the AI layer sees it only
through `SchoolsProvider` (#2). No direct coupling — when the pipeline runs, the
schools adapter starts returning data and school-aware advisors light up.

## 8. Real LLM providers
**Seam:** `LLMProvider` + `HttpTransport`.
**Wire:**
- [ ] Provide a fetch-based `HttpTransport` (json + SSE stream parsing).
- [ ] `createAdvisorContainer({ provider: new OpenAICompatibleProvider(cfg, transport) })`
      or the Anthropic adapter. Swap freely per environment; the `ScriptedProvider`
      remains for tests/offline.

---
### Integration order (matches the platform roadmap)
1. Import Pipeline populates Schools →
2. `SchoolsProvider` + `ScoresProvider` adapters (Score Engine via backend) →
3. Real `LLMProvider` (OpenAI/Anthropic) →
4. Backend-backed context providers + DB memory + auth →
5. Dashboard wiring (SSE) →
6. Recommendation advisor.
Each step is additive and independently shippable.
