import type { CacheStore } from './CacheStore.js';

/**
 * Minimal Redis surface this cache needs. Any client (ioredis, node-redis,
 * Upstash) can satisfy it via a thin adapter — keeps the redis dependency out
 * of this package. `redis-ready`: swap MemoryCache → RedisCache in the container.
 */
export interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: 'EX', ttl?: number): Promise<unknown>;
  del(key: string): Promise<unknown>;
  scan(cursor: string, match: 'MATCH', pattern: string): Promise<[string, string[]]>;
}

export class RedisCache implements CacheStore {
  constructor(
    private readonly redis: RedisLike,
    private readonly namespace = 'bap',
  ) {}

  private k(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(this.k(key));
    return raw === null ? null : (JSON.parse(raw) as T);
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds) await this.redis.set(this.k(key), payload, 'EX', ttlSeconds);
    else await this.redis.set(this.k(key), payload);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(this.k(key));
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    let cursor = '0';
    const pattern = `${this.k(prefix)}*`;
    do {
      const [next, keys] = await this.redis.scan(cursor, 'MATCH', pattern);
      cursor = next;
      for (const key of keys) await this.redis.del(key);
    } while (cursor !== '0');
  }
}
