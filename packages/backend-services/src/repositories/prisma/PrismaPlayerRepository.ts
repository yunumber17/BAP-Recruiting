/**
 * Prisma implementation of IPlayerRepository. Compiles once `prisma generate`
 * has run in @bap/database (the generated client provides the model delegates).
 * Excluded from the offline typecheck config; included by tsconfig.build.json.
 */
import type { PrismaClient, Prisma } from '@prisma/client';
import type { UUID } from '../../types/common.js';
import type { Player } from '../../types/models.js';
import type {
  IPlayerRepository, PlayerCreateInput, PlayerUpdateInput,
} from '../interfaces.js';
import { DatabaseError, NotFoundError } from '../../errors/index.js';

type PlayerRow = Prisma.PlayerGetPayload<Record<string, never>>;

function toDomain(row: PlayerRow): Player {
  return {
    id: row.id,
    userId: row.userId,
    firstName: row.firstName,
    lastName: row.lastName,
    graduationYear: row.graduationYear,
    gpa: row.gpa ? Number(row.gpa) : null,
    sat: row.sat,
    act: row.act,
    primaryPosition: row.primaryPosition,
    secondaryPosition: row.secondaryPosition,
    heightCm: row.heightCm ? Number(row.heightCm) : null,
    weightKg: row.weightKg ? Number(row.weightKg) : null,
    throws: row.throws,
    bats: row.bats,
    state: row.state,
    country: row.country,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaPlayerRepository implements IPlayerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UUID): Promise<Player | null> {
    try {
      const row = await this.prisma.player.findFirst({ where: { id, deletedAt: null } });
      return row ? toDomain(row) : null;
    } catch (e) {
      throw new DatabaseError('findById(player) failed', e);
    }
  }

  async findByUserId(userId: UUID): Promise<Player | null> {
    const row = await this.prisma.player.findFirst({ where: { userId, deletedAt: null } });
    return row ? toDomain(row) : null;
  }

  async create(input: PlayerCreateInput): Promise<Player> {
    try {
      const row = await this.prisma.player.create({
        data: {
          userId: input.userId,
          firstName: input.firstName,
          lastName: input.lastName,
          graduationYear: input.graduationYear,
          primaryPosition: input.primaryPosition,
          gpa: input.gpa ?? undefined,
          secondaryPosition: input.secondaryPosition ?? undefined,
          heightCm: input.heightCm ?? undefined,
          weightKg: input.weightKg ?? undefined,
          throws: input.throws ?? undefined,
          bats: input.bats ?? undefined,
          state: input.state ?? undefined,
          country: input.country ?? undefined,
        },
      });
      return toDomain(row);
    } catch (e) {
      throw new DatabaseError('create(player) failed', e);
    }
  }

  async update(id: UUID, input: PlayerUpdateInput): Promise<Player> {
    const existing = await this.prisma.player.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Player', id);
    const row = await this.prisma.player.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        graduationYear: input.graduationYear,
        primaryPosition: input.primaryPosition,
        gpa: input.gpa ?? undefined,
        secondaryPosition: input.secondaryPosition ?? undefined,
        heightCm: input.heightCm ?? undefined,
        weightKg: input.weightKg ?? undefined,
        throws: input.throws ?? undefined,
        bats: input.bats ?? undefined,
        state: input.state ?? undefined,
      },
    });
    return toDomain(row);
  }

  async softDelete(id: UUID): Promise<void> {
    await this.prisma.player.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
