/** Small, dependency-free numeric + grading helpers. */
import type { LetterGrade, Region } from './types.js';

export const clamp = (v: number, lo = 0, hi = 100): number =>
  Math.max(lo, Math.min(hi, v));

export const round = (v: number, dp = 1): number => {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
};

/** Weighted mean that ignores undefined/NaN entries. Returns 0 if all missing. */
export function weightedMean(
  parts: ReadonlyArray<{ value: number | undefined; weight: number }>,
): number {
  let num = 0;
  let den = 0;
  for (const p of parts) {
    if (p.value === undefined || Number.isNaN(p.value) || p.weight <= 0) continue;
    num += p.value * p.weight;
    den += p.weight;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * Map a measurable to a 0–100 score using a two-point anchor.
 * `floor` maps to 50, `good` maps to 90; the line is extended and clamped to
 * 0–100. Works for higher-is-better (good > floor) and lower-is-better
 * (good < floor, e.g. 60-yard dash / pop time) automatically.
 */
export function scaleMetric(value: number, floor: number, good: number): number {
  if (good === floor) return 50;
  const t = (value - floor) / (good - floor); // 0 at floor, 1 at good
  return clamp(50 + t * 40);
}

/** Percentage of provided (non-undefined) fields — used for confidence. */
export function completeness(fields: ReadonlyArray<unknown>): number {
  if (fields.length === 0) return 0;
  const have = fields.filter((f) => f !== undefined && f !== null).length;
  return (have / fields.length) * 100;
}

export function letterGrade(score: number): LetterGrade {
  const s = clamp(score);
  if (s >= 97) return 'A+';
  if (s >= 93) return 'A';
  if (s >= 90) return 'A-';
  if (s >= 87) return 'B+';
  if (s >= 83) return 'B';
  if (s >= 80) return 'B-';
  if (s >= 77) return 'C+';
  if (s >= 73) return 'C';
  if (s >= 70) return 'C-';
  if (s >= 67) return 'D+';
  if (s >= 60) return 'D';
  return 'F';
}

/** Great-circle distance in miles between two lat/lng points. */
export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** US-state → region, used when a GeoPoint lacks an explicit region. */
const STATE_REGION: Readonly<Record<string, Region>> = {
  CA: 'West', OR: 'West', WA: 'West', AZ: 'West', NV: 'West', CO: 'West',
  UT: 'West', NM: 'West', ID: 'West', MT: 'West', WY: 'West', AK: 'West', HI: 'West',
  IL: 'Midwest', IN: 'Midwest', IA: 'Midwest', KS: 'Midwest', MI: 'Midwest',
  MN: 'Midwest', MO: 'Midwest', NE: 'Midwest', ND: 'Midwest', SD: 'Midwest',
  OH: 'Midwest', WI: 'Midwest',
  TX: 'South', OK: 'South', AR: 'South', LA: 'South', MS: 'South', AL: 'South',
  TN: 'South', KY: 'South', GA: 'South', FL: 'South', SC: 'South', NC: 'South',
  VA: 'South', WV: 'South', MD: 'South', DE: 'South', DC: 'South',
  NY: 'Northeast', NJ: 'Northeast', PA: 'Northeast', CT: 'Northeast',
  RI: 'Northeast', MA: 'Northeast', VT: 'Northeast', NH: 'Northeast', ME: 'Northeast',
};

export function regionForState(state: string | undefined): Region | undefined {
  if (!state) return undefined;
  return STATE_REGION[state.toUpperCase()];
}
