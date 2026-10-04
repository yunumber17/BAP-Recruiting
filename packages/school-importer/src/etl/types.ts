/**
 * Reusable ETL framework — core types. A "resource" (Schools, and later Players,
 * Coaches, Showcases…) plugs a ResourceDefinition into the generic Pipeline.
 */

/** A raw row as read from a source (CSV values are strings; JSON may be typed). */
export type RawRecord = Record<string, unknown>;

/** Streaming source of raw records. Implementations must NOT buffer the file. */
export interface RecordSource {
  /** Yields records in file order, with a 0-based index. */
  read(): AsyncIterable<{ index: number; raw: RawRecord }>;
  /** Human label for reports/logs. */
  readonly describe: string;
}

export interface ValidationIssue {
  index: number;
  field: string;
  message: string;
  value?: unknown;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

/** Column mapping: canonical field name → source column header (or headers). */
export type ColumnMapping = Record<string, string | string[]>;

/** What the importer decided to do with one record. */
export type RecordOutcome = 'created' | 'updated' | 'skipped' | 'duplicate' | 'failed' | 'invalid';

/**
 * Per-resource contract consumed by the Pipeline. TRecord is the validated,
 * persistable shape; TKey is the natural key (e.g. extId) used for idempotency.
 */
export interface ResourceDefinition<TRecord, TKey extends string | number> {
  readonly name: string;
  /** Normalize a raw row in place-safe fashion (whitespace, encoding, …). */
  normalize(raw: RawRecord): RawRecord;
  /** Map source columns → a candidate object using the mapping. */
  map(raw: RawRecord, mapping: ColumnMapping): RawRecord;
  /** Validate + coerce into TRecord (zod). Field-level issues on failure. */
  validate(candidate: RawRecord, index: number): ValidationResult<TRecord>;
  /** Cross-field business rules; empty array = pass. */
  businessValidate(record: TRecord, index: number): ValidationIssue[];
  /** Natural key for idempotency + inactive-pruning. */
  naturalKey(record: TRecord): TKey;
  /** Stable content hash of the persisted fields, to detect changes. */
  contentHash(record: TRecord): string;
  readonly defaultMapping: ColumnMapping;
}

/** Existing-row fingerprint used to decide create/update/skip. */
export interface ExistingFingerprint<TKey> {
  key: TKey;
  hash: string;
  active: boolean;
}

/**
 * Idempotent persistence contract. The Prisma and in-memory repos both satisfy
 * it. The repo is responsible ONLY for data access — no business logic.
 */
export interface UpsertRepository<TRecord, TKey extends string | number> {
  /** Load key→fingerprint for ALL existing rows (for diffing + pruning). */
  loadFingerprints(): Promise<Map<string, ExistingFingerprint<TKey>>>;
  /** Upsert a batch. Returns per-key outcome ('created' | 'updated'). */
  upsertBatch(records: readonly TRecord[]): Promise<Map<string, 'created' | 'updated'>>;
  /** Mark keys inactive (soft) — for rows removed from source. Returns count. */
  markInactive(keys: readonly TKey[]): Promise<number>;
  /** Re-activate a previously inactive key that reappeared in source. */
  reactivate(keys: readonly TKey[]): Promise<number>;
}

export interface ImportStats {
  total: number;
  imported: number; // created
  updated: number;
  skipped: number; // unchanged
  duplicates: number; // within-file
  failed: number; // db / load errors
  invalid: number; // validation / business-rule failures
  markedInactive: number;
  reactivated: number;
}

export interface PipelineOptions {
  batchSize: number;
  dryRun: boolean;
  validateOnly: boolean;
  resume: boolean;
  prune: boolean; // mark source-removed rows inactive
  mapping?: ColumnMapping;
  checkpointPath: string;
  reportDir: string;
}

export interface PipelineResult {
  stats: ImportStats;
  elapsedMs: number;
  reportPath: string;
  completed: boolean;
}
