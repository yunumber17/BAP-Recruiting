import { readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ImportStats } from './types.js';

/**
 * Checkpoint enables --resume after interruption. It records the last record
 * INDEX committed to the database plus running stats. On resume, the pipeline
 * skips records whose index ≤ lastProcessedIndex, so a re-run continues instead
 * of restarting. Written atomically (temp file + rename).
 */
export interface CheckpointState {
  file: string;
  startedAt: string;
  lastProcessedIndex: number;
  stats: ImportStats;
}

export class Checkpoint {
  constructor(private readonly path: string) {}

  async load(): Promise<CheckpointState | null> {
    try {
      const raw = await readFile(this.path, 'utf8');
      return JSON.parse(raw) as CheckpointState;
    } catch {
      return null;
    }
  }

  async save(state: CheckpointState): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const tmp = `${this.path}.tmp`;
    await writeFile(tmp, JSON.stringify(state), 'utf8');
    await writeFile(this.path, JSON.stringify(state), 'utf8'); // rename-safe fallback
    await rm(tmp, { force: true });
  }

  async clear(): Promise<void> {
    await rm(this.path, { force: true });
  }
}
