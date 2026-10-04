# Prisma repositories

These files implement the repository interfaces (`src/repositories/interfaces.ts`)
against the generated Prisma client from `@bap/database`.

They are **excluded from the offline typecheck** (`tsconfig.json`) because they
import model delegates (`prisma.player`, `prisma.savedSchool`, …) that only exist
after `prisma generate` runs in the database package. `tsconfig.build.json`
includes them for the real build.

`PrismaPlayerRepository` and `PrismaSavedSchoolRepository` are the reference
implementations. Every remaining repository (School, PlayerMetric,
RecruitingScore, Task, Notification, CoachContact, Application, Video, Analytics,
ActivityLog) follows the identical pattern:

1. `constructor(private prisma: PrismaClient)`
2. a `toDomain(row)` mapper (Prisma row → DTO in `types/models.ts`)
3. queries filtered by `deletedAt: null` for soft-deletable tables
4. failures wrapped in `DatabaseError`

Wire them into `src/di/container.ts` in place of the in-memory repositories once
`@bap/database` is generated and a `PrismaClient` is available.
