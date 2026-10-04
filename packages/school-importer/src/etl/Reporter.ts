import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CsvFileWriter } from '../utils/csv.js';
import type { ImportStats, ValidationIssue } from './types.js';

/**
 * Streams failure/duplicate/validation rows to CSV as they occur (no buffering)
 * and writes import-report.json + summary.txt at the end. Also appends a line to
 * import-history.jsonl for auditability.
 */
export class Reporter {
  private readonly failed: CsvFileWriter;
  private readonly duplicates: CsvFileWriter;
  private readonly validation: CsvFileWriter;
  private failedCount = 0;
  private duplicateCount = 0;
  private validationCount = 0;

  constructor(private readonly dir: string) {
    this.failed = new CsvFileWriter(join(dir, 'failed-records.csv'), ['index', 'key', 'reason']);
    this.duplicates = new CsvFileWriter(join(dir, 'duplicate-records.csv'), ['index', 'key']);
    this.validation = new CsvFileWriter(join(dir, 'validation-errors.csv'), [
      'index', 'field', 'message', 'value',
    ]);
  }

  static async create(dir: string): Promise<Reporter> {
    await mkdir(dir, { recursive: true });
    return new Reporter(dir);
  }

  recordFailure(index: number, key: string, reason: string): void {
    this.failed.write([index, key, reason]);
    this.failedCount += 1;
  }
  recordDuplicate(index: number, key: string): void {
    this.duplicates.write([index, key]);
    this.duplicateCount += 1;
  }
  recordValidation(issues: readonly ValidationIssue[]): void {
    for (const i of issues) {
      this.validation.write([i.index, i.field, i.message, i.value ?? '']);
      this.validationCount += 1;
    }
  }

  async finish(input: {
    file: string;
    stats: ImportStats;
    elapsedMs: number;
    dryRun: boolean;
    completed: boolean;
  }): Promise<string> {
    await Promise.all([this.failed.close(), this.duplicates.close(), this.validation.close()]);

    const report = {
      file: input.file,
      completedAt: new Date().toISOString(),
      dryRun: input.dryRun,
      completed: input.completed,
      elapsedMs: input.elapsedMs,
      stats: input.stats,
      artifacts: {
        failed: 'failed-records.csv',
        duplicates: 'duplicate-records.csv',
        validationErrors: 'validation-errors.csv',
      },
    };
    const reportPath = join(this.dir, 'import-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    await writeFile(join(this.dir, 'summary.txt'), this.summary(input), 'utf8');
    await appendFile(join(this.dir, '..', 'import-history.jsonl'), JSON.stringify(report) + '\n', 'utf8').catch(() => undefined);
    return reportPath;
  }

  private summary(input: { file: string; stats: ImportStats; elapsedMs: number; dryRun: boolean }): string {
    const s = input.stats;
    return [
      `School import ${input.dryRun ? '(DRY RUN)' : ''}`,
      `File:            ${input.file}`,
      `Elapsed:         ${(input.elapsedMs / 1000).toFixed(2)}s`,
      `Total records:   ${s.total}`,
      `Imported (new):  ${s.imported}`,
      `Updated:         ${s.updated}`,
      `Skipped (same):  ${s.skipped}`,
      `Duplicates:      ${s.duplicates}`,
      `Invalid:         ${s.invalid}`,
      `Failed:          ${s.failed}`,
      `Marked inactive: ${s.markedInactive}`,
      `Reactivated:     ${s.reactivated}`,
      '',
    ].join('\n');
  }
}
