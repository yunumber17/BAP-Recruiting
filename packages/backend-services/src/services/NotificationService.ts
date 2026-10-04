import type { UUID } from '../types/common.js';
import type { Notification } from '../types/models.js';
import type { INotificationRepository } from '../repositories/interfaces.js';
import type { EventBus } from '../events/EventBus.js';

export class NotificationService {
  constructor(
    private readonly repo: INotificationRepository,
    private readonly events: EventBus,
  ) {}

  async list(userId: UUID, unreadOnly = false): Promise<Notification[]> {
    return this.repo.listByUser(userId, unreadOnly);
  }

  async send(input: {
    userId: UUID;
    type: Notification['type'];
    title: string;
    body?: string | null;
    data?: unknown;
  }): Promise<Notification> {
    const n = await this.repo.create(input);
    await this.events.emit('NotificationSent', { userId: n.userId, notificationId: n.id });
    return n;
  }

  async markRead(id: UUID): Promise<Notification> {
    return this.repo.markRead(id);
  }
}
