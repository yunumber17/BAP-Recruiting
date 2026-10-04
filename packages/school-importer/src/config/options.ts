import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import type { ColumnMapping, PipelineOptions } from '../etl/types.js';

export interface CliOptions extends PipelineOptions {
  file: string;
  format: 'auto' | 'csv' | 'json';
  reportOnly: boolean;
}

/** Parse CLI flags into typed options. Fails fast on bad input. */
export function parseCliOptions(argv: string[]): CliOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      file: { type: 'string', default: 'schools.csv' },
      format: { type: 'string', default: 'auto' },
      'batch-size': { type: 'string', default: '500' },
      mapping: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      'validate-only': { type: 'boolean', default: false },
      resume: { type: 'boolean', default: false },
      'no-prune': { type: 'boolean', default: false },
      report: { type: 'boolean', default: false },
      'report-dir': { type: 'string', default: 'reports' },
      'checkpoint': { type: 'string', default: '.checkpoints/schools.json' },
    },
    allowPositionals: true,
  });

  const format = values.format as CliOptions['format'];
  if (!['auto', 'csv', 'json'].includes(format)) throw new Error(`invalid --format: ${format}`);

  let mapping: ColumnMapping | undefined;
  if (values.mapping) {
    mapping = JSON.parse(readFileSync(resolve(values.mapping), 'utf8')) as ColumnMapping;
  }

  const batchSize = Number(values['batch-size']);
  if (!Number.isInteger(batchSize) || batchSize <= 0) throw new Error('invalid --batch-size');

  return {
    file: resolve(values.file as string),
    format,
    batchSize,
    dryRun: values['dry-run'] as boolean,
    validateOnly: values['validate-only'] as boolean,
    resume: values.resume as boolean,
    prune: !(values['no-prune'] as boolean),
    reportOnly: values.report as boolean,
    mapping,
    reportDir: resolve(values['report-dir'] as string),
    checkpointPath: resolve(values.checkpoint as string),
  };
}
