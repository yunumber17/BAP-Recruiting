import type { UUID } from '../types/common.js';
import type { Task } from '../types/models.js';
import type { ITaskRepository } from '../repositories/interfaces.js';
import type { EventBus } from '../events/EventBus.js';
import { NotFoundError, ForbiddenError } from '../errors/index.js';
import type { AuthContext } from '../auth/index.js';
import { Policy } from '../auth/index.js';

export class TaskService {
  constructor(
    private readonly tasks: ITaskRepository,
    private readonly events: EventBus,
  ) {}

  async list(playerId: UUID, actor: AuthContext): Promise<Task[]> {
    if (!Policy.ownsPlayer(actor, playerId)) throw new ForbiddenError('Not permitted');
    return this.tasks.listByPlayer(playerId);
  }

  async add(playerId: UUID, text: string, actor: AuthContext, dueDate?: Date): Promise<Task> {
    if (!Policy.ownsPlayer(actor, playerId)) throw new ForbiddenError('Not permitted');
    return this.tasks.create({ playerId, text, dueDate: dueDate ?? null });
  }

  async complete(id: UUID, playerId: UUID, actor: AuthContext): Promise<Task> {
    if (!Policy.ownsPlayer(actor, playerId)) throw new ForbiddenError('Not permitted');
    const task = await this.tasks.setStatus(id, 'DONE');
    if (!task) throw new NotFoundError('Task', id);
    await this.events.emit('TaskCompleted', { playerId, taskId: id });
    return task;
  }

  async remove(id: UUID, playerId: UUID, actor: AuthContext): Promise<void> {
    if (!Policy.ownsPlayer(actor, playerId)) throw new ForbiddenError('Not permitted');
    await this.tasks.softDelete(id);
  }
}
