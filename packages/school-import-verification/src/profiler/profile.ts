import type { SchoolRecord } from "../integrity/canonical.js";
import { describe, outlierBounds, type Summary } from "../statistics/describe.js";

export interface Coverage { readonly field: string; readonly present: number; readonly pct: number; }
export interface Ranked { readonly name: string; readonly value: number; }

export interface DatasetProfile {
  readonly total: number;
  readonly byDivision: ReadonlyMap<string, number>;
  readonly byControl: ReadonlyMap<string, number>;
  readonly byState: ReadonlyMap<string, number>;
  readonly byConference: ReadonlyMap<string, number>;
  readonly enrollment: Summary;
  readonly tuition: Summary;
  readonly netCost: Summary;
  readonly acceptance: Summary;
  readonly retention: Summary;
  readonly graduation: Summary;
  readonly roster: Summary;
  readonly coverage: readonly Coverage[];
  readonly duplicateNames: readonly string[];       // names shared across rows
  readonly duplicateNameState: readonly string[];   // true duplicates (same name+state)
  readonly duplicateSourceUrls: readonly string[];
  readonly top20Largest: readonly Ranked[];
  readonly top20Smallest: readonly Ranked[];
  readonly top20HighestTuition: readonly Ranked[];
  readonly top20LowestTuition: readonly Ranked[];
  readonly enrollmentOutliers: readonly Ranked[];
  readonly rosterOutliers: readonly Ranked[];
}

function tally<T>(items: readonly T[], key: (t: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const it of items) { const k = key(it); m.set(k, (m.get(k) ?? 0) + 1); }
  return new Map([...m.entries()].sort((a, b) => b[1] - a[1]));
}

const NUMERIC_FIELDS: (keyof SchoolRecord)[] = [];

function coverageOf(records: readonly SchoolRecord[]): Coverage[] {
  const fields = Object.keys(records[0] ?? {}) as (keyof SchoolRecord)[];
  return fields.map((f) => {
    const present = records.filter((r) => {
      const v = r[f];
      if (v == null) return false;
      if (Array.isArray(v)) return v.length > 0;
      return String(v).trim() !== "";
    }).length;
    return { field: String(f), present, pct: round(100 * present / records.length) };
  });
}

function topN(records: readonly SchoolRecord[], pick: (r: SchoolRecord) => number | null, n: number, dir: "hi" | "lo"): Ranked[] {
  const rows = records
    .map((r) => ({ name: r.name, value: pick(r) }))
    .filter((x): x is Ranked => x.value != null && Number.isFinite(x.value) && (dir === "lo" ? x.value > 0 : true));
  rows.sort((a, b) => (dir === "hi" ? b.value - a.value : a.value - b.value));
  return rows.slice(0, n);
}

export function profileDataset(records: readonly SchoolRecord[]): DatasetProfile {
  void NUMERIC_FIELDS;
  const enr = records.map((r) => r.enrollment);
  const ros = records.map((r) => r.rosterSize);

  const nameCounts = tally(records, (r) => r.name.toLowerCase());
  const duplicateNames = [...nameCounts.entries()].filter(([, c]) => c > 1).map(([k]) => k);
  const nsCounts = tally(records, (r) => `${r.name.toLowerCase()}|${r.state.toLowerCase()}`);
  const duplicateNameState = [...nsCounts.entries()].filter(([, c]) => c > 1).map(([k]) => k);
  const urlCounts = tally(records.filter((r) => r.sourceUrl), (r) => r.sourceUrl!);
  const duplicateSourceUrls = [...urlCounts.entries()].filter(([, c]) => c > 1).map(([k]) => k);

  const enrB = outlierBounds(enr);
  const rosB = outlierBounds(ros);
  const enrichmentOutliers = (bounds: { lo: number; hi: number } | null, pick: (r: SchoolRecord) => number | null): Ranked[] =>
    bounds == null ? [] : records
      .map((r) => ({ name: r.name, value: pick(r) }))
      .filter((x): x is Ranked => x.value != null && (x.value < bounds.lo || x.value > bounds.hi))
      .sort((a, b) => b.value - a.value);

  return {
    total: records.length,
    byDivision: tally(records, (r) => r.division),
    byControl: tally(records, (r) => r.control),
    byState: tally(records, (r) => r.state),
    byConference: tally(records, (r) => r.conference ?? "(none)"),
    enrollment: describe(enr),
    tuition: describe(records.map((r) => r.tuitionOutState)),
    netCost: describe(records.map((r) => r.netCost)),
    acceptance: describe(records.map((r) => r.acceptanceRate)),
    retention: describe(records.map((r) => r.retentionRate)),
    graduation: describe(records.map((r) => r.graduationRate)),
    roster: describe(ros),
    coverage: coverageOf(records),
    duplicateNames,
    duplicateNameState,
    duplicateSourceUrls,
    top20Largest: topN(records, (r) => r.enrollment, 20, "hi"),
    top20Smallest: topN(records, (r) => r.enrollment, 20, "lo"),
    top20HighestTuition: topN(records, (r) => r.tuitionOutState, 20, "hi"),
    top20LowestTuition: topN(records, (r) => r.tuitionOutState, 20, "lo"),
    enrollmentOutliers: enrichmentOutliers(enrB, (r) => r.enrollment),
    rosterOutliers: enrichmentOutliers(rosB, (r) => r.rosterSize),
  };
}

function round(n: number): number { return Math.round(n * 10) / 10; }
