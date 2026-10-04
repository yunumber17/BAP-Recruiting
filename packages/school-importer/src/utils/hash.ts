import { createHash } from 'node:crypto';

/** Canonical JSON: object keys sorted recursively so hashing is order-stable. */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      out[k] = sortDeep((v as Record<string, unknown>)[k]);
    }
    return out;
  }
  return v;
}

/** Stable content hash (sha256 hex) of any JSON-serializable value. */
export function contentHash(value: unknown): string {
  return createHash('sha256').update(canonicalize(value)).digest('hex');
}
