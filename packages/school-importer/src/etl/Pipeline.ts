import type { Logger } from '../utils/logger.js';
import { Checkpoint, type CheckpointState } from './Checkpoint.js';
import { Reporter } from './Reporter.js';
import type {
  RecordSource, ResourceDefinition, UpsertRepository, PipelineOptions, PipelineResult,
  ImportStats, ExistingFingerprint,
} from './types.js';

const emptyStats = (): ImportStats => ({
  total: 0, imported: 0, updated: 0, skipped: 0, duplicates: 0,
  failed: 0, invalid: 0, markedInactive: 0, reactivated: 0,
});

/**
 * Generic ETL orchestrator. Streams the source, runs
 * normalize → map → validate → business-validate → dedupe → diff → upsert in
 * batches, checkpoints for resume, prunes source-removed rows, and reports.
 * Reusable for any resource that supplies a ResourceDefinition + repository.
 */
export class Pipeline<TRecord, TKey extends string | number> {
  constructor(
    private readonly resource: ResourceDefinition<TRecord, TKey>,
    private readonly repo: UpsertRepository<TRecord, TKey>,
    private readonly logger: Logger,
  ) {}

  async run(source: RecordSource, opts: PipelineOptions): Promise<PipelineResult> {
    const started = Date.now();
    const reporter = await Reporter.create(opts.reportDir);
    const checkpoint = new Checkpoint(opts.checkpointPath);
    const mapping = opts.mapping ?? this.resource.defaultMapping;

    // Resume: restore prior progress.
    let resumeFrom = -1;
    let stats = emptyStats();
    if (opts.resume) {
      const prior = await checkpoint.load();
      if (prior) {
        resumeFrom = prior.lastProcessedIndex;
        stats = prior.stats;
        this.logger.info({ resumeFrom, stats }, 'resuming from checkpoint');
      }
    }

    // Existing fingerprints for idempotent diffing + pruning (skipped in validate-only).
    const fingerprints = opts.validateOnly
      ? new Map<string, ExistingFingerprint<TKey>>()
      : await this.repo.loadFingerprints();

    const seen = new Set<string>();
    let batch: TRecord[] = [];
    let batchKeys: string[] = [];
    let lastIndex = resumeFrom;
    let sinceCkpt = 0;

    const flush = async (): Promise<void> => {
      if (batch.length === 0) return;
      if (opts.dryRun || opts.validateOnly) {
        for (const k of batchKeys) {
          if (fingerprints.has(k)) stats.updated += 1;
          else stats.imported += 1;
        }
      } else {
        try {
          const outcomes = await this.upsertWithRetry(batch);
          for (const [, outcome] of outcomes) {
            if (outcome === 'created') stats.imported += 1;
            else stats.updated += 1;
          }
        } catch (err) {
          stats.failed += batch.length;
          for (const k of batchKeys) reporter.recordFailure(lastIndex, k, (err as Error).message);
          this.logger.error({ err, size: batch.length }, 'batch upsert failed');
        }
      }
      batch = [];
      batchKeys = [];
      await checkpoint.save(this.checkpointState(source, lastIndex, stats));
    };

    for await (const { index, raw } of source.read()) {
      if (index <= resumeFrom) continue; // already processed
      lastIndex = index;
      stats.total += 1;
      sinceCkpt += 1;

      const normalized = this.resource.normalize(raw);
      const mapped = this.resource.map(normalized, mapping);
      const validated = this.resource.validate(mapped, index);
      if (!validated.ok) {
        reporter.recordValidation(validated.issues);
        stats.invalid += 1;
        continue;
      }
      const record = validated.value;
      const businessIssues = this.resource.businessValidate(record, index);
      if (businessIssues.length > 0) {
        reporter.recordValidation(businessIssues);
        stats.invalid += 1;
        continue;
      }

      const keyStr = String(this.resource.naturalKey(record));
      if (seen.has(keyStr)) {
        reporter.recordDuplicate(index, keyStr);
        stats.duplicates += 1;
        continue;
      }
      seen.add(keyStr);

      if (opts.validateOnly) continue;

      const hash = this.resource.contentHash(record);
      const existing = fingerprints.get(keyStr);
      const unchanged = existing && existing.active && existing.hash === hash;
      if (unchanged) {
        stats.skipped += 1;
      } else {
        batch.push(record);
        batchKeys.push(keyStr);
        if (batch.length >= opts.batchSize) await flush();
      }

      if (sinceCkpt >= opts.batchSize) {
        await checkpoint.save(this.checkpointState(source, lastIndex, stats));
        sinceCkpt = 0;
      }
    }
    await flush();

    // Reactivate rows that were inactive but reappeared in source (same key).
    if (!opts.dryRun && !opts.validateOnly) {
      const reappeared = [...fingerprints.values()]
        .filter((f) => !f.active && seen.has(String(f.key)))
        .map((f) => f.key);
      if (reappeared.length > 0) stats.reactivated += await this.repo.reactivate(reappeared);
    }

    // Prune: mark source-removed (currently active, unseen) rows inactive.
    if (opts.prune && !opts.dryRun && !opts.validateOnly) {
      const removed = [...fingerprints.values()]
        .filter((f) => f.active && !seen.has(String(f.key)))
        .map((f) => f.key);
      if (removed.length > 0) stats.markedInactive = await this.repo.markInactive(removed);
    }

    const elapsedMs = Date.now() - started;
    const reportPath = await reporter.finish({
      file: source.describe, stats, elapsedMs, dryRun: opts.dryRun, completed: true,
    });
    if (!opts.dryRun && !opts.validateOnly) await checkpoint.clear();

    this.logger.info({ stats, elapsedMs }, 'import complete');
    return { stats, elapsedMs, reportPath, completed: true };
  }

  private async upsertWithRetry(batch: readonly TRecord[]): Promise<Map<string, 'created' | 'updated'>> {
    try {
      return await this.repo.upsertBatch(batch);
    } catch (err) {
      this.logger.warn({ err }, 'batch failed, retrying once');
      return this.repo.upsertBatch(batch);
    }
  }

  private checkpointState(source: RecordSource, lastProcessedIndex: number, stats: ImportStats): CheckpointState {
    return { file: source.describe, startedAt: new Date().toISOString(), lastProcessedIndex, stats };
  }
}
