# @bap/backend-services

Layered backend service layer for the BAP recruiting platform.
`API → Controllers → Services → Repositories → Prisma → PostgreSQL`.

Business logic lives **only** in services. Repositories only touch Prisma.
Controllers only validate + call services. The Recruiting Score Engine and the
Prisma package are treated as **immutable external dependencies** — this layer
depends on interfaces, never on their internals, and neither is integrated yet.

- **Strict TypeScript**, no `any`, ESLint + Prettier.
- **Zod** validation on params/query/body (and response schemas).
- **Typed errors** + centralized error middleware.
- **Pino** logging — every request logs request-id, duration, user id, status.
- **Cache abstraction** with memory + redis-ready implementations (DI swap).
- **In-memory event bus** with a typed domain-event map.
- **Constructor injection** throughout via a composition-root container.
- **27 tests** (service + infra + supertest API integration) — all green.

## Run
```bash
npm install
cp .env.example .env
npm run typecheck      # strict tsc (excludes Prisma repos; see below)
npm test               # vitest: services, infra, API
npm run dev            # tsx watch → http://localhost:8080
curl localhost:8080/health
```

## Layout
```
src/
  config/        env loading + validation (zod)
  errors/        AppError hierarchy (Validation/NotFound/Conflict/…)
  utils/         pino logger, asyncHandler
  types/         common (Pagination) + domain DTOs (decoupled from Prisma)
  auth/          interfaces (TokenVerifier, AuthContext, Policy) + dev verifier
  cache/         CacheStore interface, MemoryCache, RedisCache (redis-ready)
  events/        EventBus interface, InMemoryEventBus, typed event map
  middleware/    requestContext, validate, authGuard, errorHandler
  repositories/
    interfaces.ts        repository contracts (the only thing services depend on)
    inmemory/            in-memory impls (tests + local dev)
    prisma/              Prisma impls (excluded from offline typecheck*)
  services/      PlayerService, SchoolService, SavedSchoolService,
                 RecruitingService (engine behind IScoreProvider),
                 NotificationService, TaskService
  validators/    zod schemas per endpoint
  api/
    controllers/ thin controllers
    routes.ts    endpoint → validate → auth → controller
    app.ts       express app factory
  di/container.ts  composition root (constructor injection + test overrides)
  server.ts      entry point
docs/            ARCHITECTURE, API, SERVICE_DIAGRAM, FUTURE_INTEGRATION
```

\* `src/repositories/prisma/**` is excluded from `tsconfig.json` because it
imports the generated Prisma client (`prisma.player`, …), which only exists
after `prisma generate` in `@bap/database`. `tsconfig.build.json` includes it for
the real build. Two reference impls are provided (Player, SavedSchool); the rest
follow the identical pattern (`src/repositories/prisma/README.md`).

## Scope of this deliverable
Fully implemented + tested vertical: **Players, Schools, Saved Schools,
Recruiting (orchestration), Notifications, Tasks** — exercising every layer and
every cross-cutting concern. The remaining entities from the schema
(CoachContacts, Messages, Applications, Videos, Metrics, Documents, Analytics,
ActivityLog) have repository interfaces defined and are a mechanical copy of the
established Player/SavedSchool pattern.

See `docs/FUTURE_INTEGRATION.md` for exactly where the engine, scraper import,
recommendation engine, and frontend connect.
