import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { importSchools } from '../src/services/importSchools.js';
import { InMemorySchoolRepo } from '../src/schools/repositories/InMemorySchoolRepo.js';
import { csvSourceFromString } from '../src/etl/sources.js';
import { Checkpoint } from '../src/etl/Checkpoint.js';
import { createLogger } from '../src/utils/logger.js';
import type { CliOptions } from '../src/config/options.js';

const HEADER = 'id,name,city,state,division,conference,type,size,tuition,scholarship,url';
const UCLA = '1,UCLA,Los Angeles,CA,D1,Big Ten,Public,31636,,,';
const STAN = '2,Stanford University,Stanford,CA,D1,ACC,Private,,,';
const TAMPA = '26,University of Tampa,Tampa,FL,NCAA D2,Sunshine State,Private,8645,$32400,yes,ut.edu';
const csv = (...rows: string[]): string => [HEADER, ...rows].join('\n') + '\n';

const logger = createLogger('silent');
let dir: string;

function opts(over: Partial<CliOptions> = {}): CliOptions {
  return {
    file: 'inline.csv', format: 'csv', batchSize: 2, dryRun: false, validateOnly: false,
    resume: false, prune: true, reportOnly: false, mapping: undefined,
    reportDir: join(dir, 'reports'), checkpointPath: join(dir, 'ckpt.json'),
    ...over,
  };
}

beforeEach(async () => { dir = await mkdtemp(join(tmpdir(), 'bap-import-')); });
afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

describe('idempotent import pipeline', () => {
  it('first import creates all rows and writes a report', async () => {
    const repo = new InMemorySchoolRepo();
    const r = await importSchools(opts(), repo, logger, csvSourceFromString(csv(UCLA, STAN, TAMPA)));
    expect(r.stats.total).toBe(3);
    expect(r.stats.imported).toBe(3);
    expect(r.stats.skipped).toBe(0);
    expect(repo.size).toBe(3);
    await expect(access(join(dir, 'reports', 'import-report.json'))).resolves.toBeUndefined();
  });

  it('re-importing the SAME csv skips everything (idempotent)', async () => {
    const repo = new InMemorySchoolRepo();
    const src = csv(UCLA, STAN, TAMPA);
    await importSchools(opts(), repo, logger, csvSourceFromString(src));
    const r2 = await importSchools(opts(), repo, logger, csvSourceFromString(src));
    expect(r2.stats.imported).toBe(0);
    expect(r2.stats.updated).toBe(0);
    expect(r2.stats.skipped).toBe(3);
  });

  it('updates only changed rows', async () => {
    const repo = new InMemorySchoolRepo();
    await importSchools(opts(), repo, logger, csvSourceFromString(csv(UCLA, STAN, TAMPA)));
    const changed = '1,UCLA Bruins,Los Angeles,CA,D1,Big Ten,Public,31636,,,'; // name changed
    const r = await importSchools(opts(), repo, logger, csvSourceFromString(csv(changed, STAN, TAMPA)));
    expect(r.stats.updated).toBe(1);
    expect(r.stats.skipped).toBe(2);
    expect(repo.get(1)?.name).toBe('UCLA Bruins');
  });

  it('marks rows removed from source inactive (never deletes)', async () => {
    const repo = new InMemorySchoolRepo();
    await importSchools(opts(), repo, logger, csvSourceFromString(csv(UCLA, STAN, TAMPA)));
    const r = await importSchools(opts(), repo, logger, csvSourceFromString(csv(UCLA, STAN))); // drop Tampa
    expect(r.stats.markedInactive).toBe(1);
    expect(repo.get(26)?.active).toBe(false); // still present, just inactive
    expect(repo.size).toBe(3);
  });

  it('reactivates a row that reappears in source', async () => {
    const repo = new InMemorySchoolRepo();
    await importSchools(opts(), repo, logger, csvSourceFromString(csv(UCLA, STAN, TAMPA)));
    await importSchools(opts(), repo, logger, csvSourceFromString(csv(UCLA, STAN))); // Tampa inactive
    const r = await importSchools(opts(), repo, logger, csvSourceFromString(csv(UCLA, STAN, TAMPA)));
    expect(repo.get(26)?.active).toBe(true);
    expect(r.stats.reactivated + r.stats.updated).toBeGreaterThanOrEqual(1);
  });

  it('detects duplicate natural keys within a file', async () => {
    const repo = new InMemorySchoolRepo();
    const dupTampa = '26,Tampa Dup,Tampa,FL,D2,SSC,Private,,,';
    const r = await importSchools(opts(), repo, logger, csvSourceFromString(csv(TAMPA, dupTampa, UCLA)));
    expect(r.stats.duplicates).toBe(1);
    expect(r.stats.imported).toBe(2);
  });

  it('dry-run writes nothing to the repository', async () => {
    const repo = new InMemorySchoolRepo();
    const r = await importSchools(opts({ dryRun: true }), repo, logger, csvSourceFromString(csv(UCLA, STAN, TAMPA)));
    expect(r.stats.imported).toBe(3); // reports what WOULD happen
    expect(repo.size).toBe(0); // but nothing persisted
  });

  it('validate-only counts invalid rows and never writes', async () => {
    const repo = new InMemorySchoolRepo();
    const bad = ',,,,bogus,,,,,,'; // missing id/name/bad division
    const r = await importSchools(opts({ validateOnly: true }), repo, logger, csvSourceFromString(csv(UCLA, bad)));
    expect(r.stats.invalid).toBe(1);
    expect(repo.size).toBe(0);
  });

  it('resume skips already-processed record indices', async () => {
    const repo = new InMemorySchoolRepo();
    // Pretend index 0 was already committed on a prior interrupted run.
    await new Checkpoint(join(dir, 'ckpt.json')).save({
      file: 'csv:string', startedAt: new Date().toISOString(), lastProcessedIndex: 0,
      stats: { total: 1, imported: 1, updated: 0, skipped: 0, duplicates: 0, failed: 0, invalid: 0, markedInactive: 0, reactivated: 0 },
    });
    const r = await importSchools(opts({ resume: true, prune: false }), repo, logger, csvSourceFromString(csv(UCLA, STAN, TAMPA)));
    // idx 0 (UCLA) skipped; idx 1,2 processed → 2 new, carried total/imported = 1
    expect(r.stats.total).toBe(3);
    expect(r.stats.imported).toBe(3);
    expect(repo.get(1)).toBeUndefined(); // UCLA (idx0) was skipped on resume
    expect(repo.size).toBe(2);
  });
});
