/**
 * Prisma implementation of ISavedSchoolRepository. See PrismaPlayerRepository
 * for the compile note. Every other repository mirrors this exact shape:
 * inject PrismaClient, map rows → domain DTOs, wrap failures in DatabaseError.
 */
import type { PrismaClient, Prisma } from '@prisma/client';
import type { UUID } from '../../types/common.js';
import type { SavedSchool } from '../../types/models.js';
import type { ISavedSchoolRepository, SavedSchoolUpsertInput } from '../interfaces.js';
import { DatabaseError, NotFoundError } from '../../errors/index.js';

type Row = Prisma.SavedSchoolGetPayload<Record<string, never>>;

function toDomain(r: Row): SavedSchool {
  return {
    id: r.id,
    playerId: r.playerId,
    schoolId: r.schoolId,
    recruitingStatus: r.recruitingStatus,
    personalRating: r.personalRating,
    isFavorite: r.isFavorite,
    notes: r.notes,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export class PrismaSavedSchoolRepository implements ISavedSchoolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPlayerAndSchool(playerId: UUID, schoolId: UUID): Promise<SavedSchool | null> {
    const r = await this.prisma.savedSchool.findFirst({
      where: { playerId, schoolId, deletedAt: null },
    });
    return r ? toDomain(r) : null;
  }

  async listByPlayer(playerId: UUID): Promise<SavedSchool[]> {
    try {
      const rows = await this.prisma.savedSchool.findMany({
        where: { playerId, deletedAt: null },
        orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
      });
      return rows.map(toDomain);
    } catch (e) {
      throw new DatabaseError('listByPlayer(savedSchool) failed', e);
    }
  }

  async create(input: SavedSchoolUpsertInput): Promise<SavedSchool> {
    const r = await this.prisma.savedSchool.create({
      data: {
        playerId: input.playerId,
        schoolId: input.schoolId,
        recruitingStatus: input.recruitingStatus ?? undefined,
        personalRating: input.personalRating ?? undefined,
        isFavorite: input.isFavorite ?? undefined,
        notes: input.notes ?? undefined,
      },
    });
    return toDomain(r);
  }

  async update(id: UUID, input: Partial<SavedSchoolUpsertInput>): Promise<SavedSchool> {
    const existing = await this.prisma.savedSchool.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('SavedSchool', id);
    const data: Prisma.SavedSchoolUpdateInput = {
      recruitingStatus: input.recruitingStatus ?? undefined,
      personalRating: input.personalRating ?? undefined,
      isFavorite: input.isFavorite ?? undefined,
      notes: input.notes ?? undefined,
    };
    const r = await this.prisma.savedSchool.update({ where: { id }, data });
    return toDomain(r);
  }

  async softDelete(id: UUID): Promise<void> {
    await this.prisma.savedSchool.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
