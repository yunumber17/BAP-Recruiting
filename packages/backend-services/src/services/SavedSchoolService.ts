import type { UUID } from '../types/common.js';
import type { SavedSchool } from '../types/models.js';
import type {
  ISavedSchoolRepository, SavedSchoolUpsertInput, ISchoolRepository,
} from '../repositories/interfaces.js';
import type { EventBus } from '../events/EventBus.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../errors/index.js';
import type { AuthContext } from '../auth/index.js';
import { Policy } from '../auth/index.js';

export class SavedSchoolService {
  constructor(
    private readonly saved: ISavedSchoolRepository,
    private readonly schools: ISchoolRepository,
    private readonly events: EventBus,
  ) {}

  async list(playerId: UUID, actor: AuthContext): Promise<SavedSchool[]> {
    this.assertOwner(actor, playerId);
    return this.saved.listByPlayer(playerId);
  }

  async save(input: SavedSchoolUpsertInput, actor: AuthContext): Promise<SavedSchool> {
    this.assertOwner(actor, input.playerId);

    const school = await this.schools.findById(input.schoolId);
    if (!school) throw new NotFoundError('School', input.schoolId);

    const existing = await this.saved.findByPlayerAndSchool(input.playerId, input.schoolId);
    if (existing) throw new ConflictError('School already saved');

    const row = await this.saved.create(input);
    await this.events.emit('SchoolSaved', { playerId: input.playerId, schoolId: input.schoolId });
    return row;
  }

  async update(
    id: UUID,
    playerId: UUID,
    patch: Partial<SavedSchoolUpsertInput>,
    actor: AuthContext,
  ): Promise<SavedSchool> {
    this.assertOwner(actor, playerId);
    return this.saved.update(id, patch);
  }

  async remove(id: UUID, playerId: UUID, actor: AuthContext): Promise<void> {
    this.assertOwner(actor, playerId);
    await this.saved.softDelete(id);
  }

  private assertOwner(actor: AuthContext, playerId: UUID): void {
    if (!Policy.ownsPlayer(actor, playerId)) {
      throw new ForbiddenError('Not permitted for this player');
    }
  }
}
