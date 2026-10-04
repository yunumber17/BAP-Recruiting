import { describe, it, expect } from 'vitest';
import { MemoryCache } from '../src/cache/MemoryCache.js';
import { InMemoryEventBus } from '../src/events/EventBus.js';
import { NotFoundError, isAppError } from '../src/errors/index.js';

describe('MemoryCache', () => {
  it('stores, reads, and deletes', async () => {
    const c = new MemoryCache();
    await c.set('a', { n: 1 });
    expect(await c.get<{ n: number }>('a')).toEqual({ n: 1 });
    await c.delete('a');
    expect(await c.get('a')).toBeNull();
  });

  it('expires by TTL', async () => {
    let t = 1000;
    const c = new MemoryCache(() => t);
    await c.set('a', 'x', 1); // 1s
    expect(await c.get('a')).toBe('x');
    t += 2000;
    expect(await c.get('a')).toBeNull();
  });

  it('deletes by prefix', async () => {
    const c = new MemoryCache();
    await c.set('player:1:x', 1);
    await c.set('player:1:y', 2);
    await c.set('player:2:z', 3);
    await c.deleteByPrefix('player:1:');
    expect(await c.get('player:1:x')).toBeNull();
    expect(await c.get('player:2:z')).toBe(3);
  });
});

describe('InMemoryEventBus', () => {
  it('delivers to handlers and supports unsubscribe', async () => {
    const bus = new InMemoryEventBus();
    let count = 0;
    const off = bus.on('TaskCompleted', () => { count += 1; });
    await bus.emit('TaskCompleted', { playerId: 'p', taskId: 't' });
    off();
    await bus.emit('TaskCompleted', { playerId: 'p', taskId: 't' });
    expect(count).toBe(1);
  });

  it('isolates a throwing handler (does not break emit)', async () => {
    const bus = new InMemoryEventBus();
    let reached = false;
    bus.on('TaskCompleted', () => { throw new Error('boom'); });
    bus.on('TaskCompleted', () => { reached = true; });
    await bus.emit('TaskCompleted', { playerId: 'p', taskId: 't' });
    expect(reached).toBe(true);
  });
});

describe('errors', () => {
  it('typed errors carry status + code and are detectable', () => {
    const e = new NotFoundError('Player', 'abc');
    expect(isAppError(e)).toBe(true);
    expect(e.status).toBe(404);
    expect(e.code).toBe('NOT_FOUND');
    expect(e.toJSON().message).toContain('abc');
  });
});
