/**
 * Cache abstraction. Services depend on this interface, never on a concrete
 * backend, so memory ↔ redis is a one-line DI swap.
 */
export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  /** Invalidate every key matching a prefix (e.g. `player:123:`). */
  deleteByPrefix(prefix: string): Promise<void>;
}

/** Build a namespaced cache key from parts. */
export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}
