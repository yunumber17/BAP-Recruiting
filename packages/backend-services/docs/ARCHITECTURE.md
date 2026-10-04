# Architecture

## Layers

```
HTTP ─▶ Middleware ─▶ Controller ─▶ Service ─▶ Repository ─▶ Prisma ─▶ PostgreSQL
        (context,      (validate     (business    (interface   (data
         auth,          input,        logic,       only)        access)
         validate,      call svc)     authz,
         errors)                      events,
                                      cache)
```

**Rules (enforced by structure, not convention):**
- Controllers import services, never repositories or Prisma.
- Services import repository **interfaces**, the event bus, and the cache —
  never Prisma, never Express, never the concrete engine.
- Repositories import Prisma (or hold in-memory state) and map to domain DTOs.
- Cross-cutting concerns (auth, logging, errors, cache, events) are injected.

## Dependency injection

`src/di/container.ts` is the single composition root. It constructs infra →
repositories → services → controllers and returns them. Everything uses
constructor injection; nothing reaches for a global. Tests call
`createContainer({ repositories: { … }, scoreProvider: fake })` to swap
implementations without touching production wiring.

## Decoupling from the immutable packages

| External package | How this layer depends on it |
|---|---|
| `@bap/recruiting-engine` | Behind `IScoreProvider` (`services/scoring.ts`). Not imported. Default `PendingScoreProvider` returns a typed 502 until wired. |
| `@bap/database` (Prisma) | Behind repository interfaces. Domain DTOs in `types/models.ts` mirror the schema but don't import the generated client, so services/controllers compile and test without it. |

## Error flow

Services throw typed `AppError`s (`NotFoundError`, `ConflictError`,
`ForbiddenError`, `ExternalServiceError`, …). Controllers don't catch — the
`asyncHandler` forwards rejections to the centralized `errorHandler`, which maps
status/code to JSON and hides internals for 5xx / non-exposable errors.

## Caching

`CacheStore` is the contract. `MemoryCache` (default) and `RedisCache`
(redis-ready via a minimal `RedisLike` port) are interchangeable. Services cache
reads (e.g. `player:{id}`, `school:{id}`) and invalidate on writes.

## Events

`EventBus` + a typed `DomainEvents` map. Services emit
(`PlayerCreated`, `SchoolSaved`, `RecruitingScoreCalculated`, …); handlers are
isolated (a throwing handler is logged, never breaks the emitter). Swap the
in-memory bus for an outbox/queue later with no service changes.

## Auth

Interface-only (`TokenVerifier`, `AuthContext`, `Policy`). The `authGuard`
middleware verifies a bearer token and attaches the context; `Policy` holds pure
authorization helpers. `DevTokenVerifier` exists for local/test only —
production plugs in Auth.js / Supabase / custom JWT by implementing the same
interface.
