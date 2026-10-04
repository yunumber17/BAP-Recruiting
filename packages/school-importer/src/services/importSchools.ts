import type { Logger } from '../utils/logger.js';
import type { UpsertRepository, PipelineResult, RecordSource } from '../etl/types.js';
import { Pipeline } from '../etl/Pipeline.js';
import { CsvStreamSource, JsonArraySource, sourceForFile } from '../etl/sources.js';
import { SchoolResource } from '../schools/SchoolResource.js';
import type { SchoolRecord } from '../schools/schema.js';
import type { CliOptions } from '../config/options.js';

/** Build the record source honoring an explicit --format. */
export function buildSource(opts: Pick<CliOptions, 'file' | 'format'>): RecordSource {
  if (opts.format === 'csv') return new CsvStreamSource(opts.file);
  if (opts.format === 'json') return new JsonArraySource(opts.file);
  return sourceForFile(opts.file);
}

/**
 * Run a Schools import with a given repository. Pure orchestration: the Schools
 * ResourceDefinition + the generic Pipeline do the work. Reusable in tests
 * (in-memory repo) and the CLI (Prisma repo).
 */
export async function importSchools(
  opts: CliOptions,
  repo: UpsertRepository<SchoolRecord, number>,
  logger: Logger,
  source: RecordSource = buildSource(opts),
): Promise<PipelineResult> {
  const pipeline = new Pipeline(SchoolResource, repo, logger);
  return pipeline.run(source, {
    batchSize: opts.batchSize,
    dryRun: opts.dryRun,
    validateOnly: opts.validateOnly,
    resume: opts.resume,
    prune: opts.prune,
    mapping: opts.mapping,
    checkpointPath: opts.checkpointPath,
    reportDir: opts.reportDir,
  });
}
