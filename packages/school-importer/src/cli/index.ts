#!/usr/bin/env node
/**
 * School Import CLI.
 *   npm run import                         # import schools.csv → Postgres
 *   npm run import -- --file schools.json  # explicit file (csv or json)
 *   npm run import -- --dry-run            # no writes; report what WOULD change
 *   npm run import -- --validate-only      # validate + report only
 *   npm run import -- --resume             # continue after interruption
 *   npm run import -- --report             # print the last import-report.json
 *   Flags: --format csv|json --batch-size N --mapping map.json --no-prune
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCliOptions } from '../config/options.js';
import { createLogger } from '../utils/logger.js';
import { importSchools } from '../services/importSchools.js';
import { InMemorySchoolRepo } from '../schools/repositories/InMemorySchoolRepo.js';
import type { UpsertRepository } from '../etl/types.js';
import type { SchoolRecord } from '../schools/schema.js';

async function main(): Promise<void> {
  const opts = parseCliOptions(process.argv.slice(2));
  const logger = createLogger();

  // --report: just print the last report and exit.
  if (opts.reportOnly) {
    const report = await readFile(join(opts.reportDir, 'import-report.json'), 'utf8').catch(() => null);
    process.stdout.write(report ?? 'No import-report.json found.\n');
    return;
  }

  // Choose repository. dry-run / validate-only need no DB → in-memory.
  // Real imports load the Prisma repo at runtime (built via tsconfig.build).
  let repo: UpsertRepository<SchoolRecord, number>;
  let disconnect: (() => Promise<void>) | undefined;
  if (opts.dryRun || opts.validateOnly) {
    repo = new InMemorySchoolRepo();
    logger.info({ mode: opts.validateOnly ? 'validate-only' : 'dry-run' }, 'no database connection needed');
  } else {
    // Variable specifier keeps the ungenerated Prisma client out of the offline
    // typecheck; the module is built via tsconfig.build.json + `prisma generate`.
    const wireSpecifier = '../schools/repositories/prisma/wire.js';
    const wire = (await import(wireSpecifier)) as {
      createPrismaSchoolRepo: () => { repo: UpsertRepository<SchoolRecord, number>; disconnect: () => Promise<void> };
    };
    const wired = wire.createPrismaSchoolRepo();
    repo = wired.repo;
    disconnect = wired.disconnect;
  }

  try {
    const result = await importSchools(opts, repo, logger);
    const summary = await readFile(join(opts.reportDir, 'summary.txt'), 'utf8').catch(() => '');
    process.stdout.write('\n' + summary + `\nReport: ${result.reportPath}\n`);
    if (result.stats.failed > 0) process.exitCode = 1;
  } finally {
    await disconnect?.();
  }
}

main().catch((err: unknown) => {
  process.stderr.write(`Import failed: ${(err as Error).message}\n`);
  process.exit(1);
});
