# Future Integration Points

Everything below is wired **without refactoring** existing services — each is a
new adapter or a repository swap in the composition root. Ordered by the project
roadmap (college database locks first).

## 1. Recruiting Score Engine  →  `IScoreProvider`
**Where:** `src/services/scoring.ts` (interface) + `src/di/container.ts` (wire).
**Today:** `PendingScoreProvider` returns `502 EXTERNAL_SERVICE_ERROR`.
**To wire:**
- [ ] Add `@bap/recruiting-engine` as a dependency.
- [ ] Create `src/services/adapters/RecruitingEngineAdapter.ts` implementing
      `IScoreProvider.score(playerId, schoolId)`:
      load the `Player` + `PlayerMetric[]` + `RecruitingPreference` and the
      `School`, map them onto the engine's `Player` / `School` inputs, call
      `new RecruitingScoreEngine().score(...)`, and return `ScoreResult`
      (`engineVersion` = the engine's package version).
- [ ] In `createContainer`, pass `scoreProvider: new RecruitingEngineAdapter(...)`.
- [ ] Optionally subscribe to `RecruitingScoreCalculated` to emit a
      `SCORE_READY` notification.
No change to `RecruitingService`, controllers, routes, or tests (the fake
provider test already proves the adapter contract).

## 2. Scraper import pipeline  →  Schools table + `SchoolService`
**Where:** `@bap/database` `schools` (+ `school_snapshots`) and the
`ISchoolRepository`.
**Today:** `SchoolService`/search are empty-safe (return empty pages).
**To wire:**
- [ ] Land the scraper output as `tools/scraper` → CSV/JSON of colleges.
- [ ] Bulk-upsert into `public.schools`, setting `extId` from the scraped id.
- [ ] Write `PrismaSchoolRepository` (mirror `PrismaSavedSchoolRepository`), and
      swap `InMemorySchoolRepository` → Prisma in the container.
- [ ] Add a GIN trigram index on `schools.name` for fuzzy search (see the DB
      package's PERFORMANCE.md) and back `SchoolService.search` with it.
- [ ] Capture `SchoolSnapshot` rows on each scraper refresh (roster/needs) for
      the engine's roster/coach-match components.

## 3. Recommendation engine  →  new `RecommendationService`
**Where:** new service, consuming existing repositories + the score engine.
**To wire:**
- [ ] Add `RecommendationService(scores, schools, preferences, provider)`.
- [ ] Strategy: read `RecruitingPreference`, page candidate `schools`, score each
      via `IScoreProvider`, rank, and return Reach/Target/Safety buckets.
- [ ] Cache per player (`recs:{playerId}`) with a short TTL; invalidate on
      `MetricsUpdated` / `PlayerUpdated` events (already emitted).
- [ ] Expose `GET /recommendations/player/:playerId`.
Depends on #1 and #2 being live.

## 4. Frontend (`bap.html` / future web app)
**Where:** the REST API in `docs/API.md`.
**To wire:**
- [ ] Point the app at `/api/*`; replace direct Supabase writes for
      player/saved-school/recruiting flows with these endpoints (or keep Supabase
      for auth and call the API for domain logic).
- [ ] Implement a real `TokenVerifier` (Supabase JWT) and inject it in the
      container, replacing `DevTokenVerifier`.
- [ ] Map the 進捗 (Score) tab to `GET /recruiting/player/:playerId`; the College
      Explorer to `GET /schools/search` + `/schools/compare`; saved list to
      `/saved-schools`.

## 5. Persistence swap (in-memory → Prisma) — general
- [ ] `prisma generate` in `@bap/database`; expose a shared `PrismaClient`.
- [ ] Implement the remaining Prisma repositories (School, PlayerMetric,
      RecruitingScore, Task, Notification, CoachContact, Application, Video,
      Analytics, ActivityLog) — each mirrors `PrismaPlayerRepository`.
- [ ] Swap them into `createContainer`; run `npm run build` with
      `tsconfig.build.json` (includes the Prisma repos).
- [ ] Add RLS/ownership at the DB layer to complement service-level `Policy`.

## 6. Operational (before production traffic)
- [ ] Redis cache: implement a `RedisLike` adapter (ioredis) and pass
      `new RedisCache(client)` to the container (`CACHE_DRIVER=redis`).
- [ ] Replace the in-memory `EventBus` with an outbox/queue for durable events.
- [ ] Rate limiting + CORS + helmet middleware in `api/app.ts`.
- [ ] Wire OpenTelemetry around the pino request logs.
