import type { DomainEvents, DomainEventName } from './events.js';
import type { Logger } from '../utils/logger.js';

export type EventHandler<N extends DomainEventName> = (
  payload: DomainEvents[N],
) => void | Promise<void>;

export interface EventBus {
  on<N extends DomainEventName>(name: N, handler: EventHandler<N>): () => void;
  emit<N extends DomainEventName>(name: N, payload: DomainEvents[N]): Promise<void>;
}

/**
 * In-memory event bus. Handlers run sequentially; a throwing handler is logged
 * and does NOT break the emitter (fire-and-observe). Swap for an outbox/queue
 * implementation later without touching services.
 */
export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<DomainEventName, Set<EventHandler<DomainEventName>>>();

  constructor(private readonly logger?: Logger) {}

  on<N extends DomainEventName>(name: N, handler: EventHandler<N>): () => void {
    const set = this.handlers.get(name) ?? new Set();
    set.add(handler as EventHandler<DomainEventName>);
    this.handlers.set(name, set);
    return () => set.delete(handler as EventHandler<DomainEventName>);
  }

  async emit<N extends DomainEventName>(name: N, payload: DomainEvents[N]): Promise<void> {
    const set = this.handlers.get(name);
    if (!set || set.size === 0) return;
    for (const handler of set) {
      try {
        await handler(payload);
      } catch (err) {
        this.logger?.error({ err, event: name }, 'event handler failed');
      }
    }
  }
}
