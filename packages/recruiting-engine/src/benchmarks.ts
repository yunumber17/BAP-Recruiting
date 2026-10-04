/**
 * Position-specific athletic benchmarks by division.
 *
 * Each metric anchor is `{ floor, good }` in the metric's native unit:
 *   floor → competitive-but-marginal (maps to ~50 via scaleMetric)
 *   good  → strong for that level     (maps to ~90)
 * Lower-is-better metrics (sixty, popTime) encode good < floor.
 *
 * Values approximate published recruiting standards (Perfect Game / NCSA style
 * guidance) and are intentionally editable in one place.
 */
import type { Division, Position } from './types.js';

export type MetricAnchor = { readonly floor: number; readonly good: number };

export type PositionGroup =
  | 'PITCHER'
  | 'CATCHER'
  | 'MIDDLE_INFIELD'
  | 'CORNER_INFIELD'
  | 'OUTFIELD'
  | 'BAT_ONLY';

export type MetricKey =
  | 'pitchingVelocity'
  | 'exitVelocity'
  | 'sixtyYardDash'
  | 'infieldVelocity'
  | 'outfieldVelocity'
  | 'popTime';

/** Which measurables matter for a group, and their relative importance. */
export const GROUP_METRIC_WEIGHTS: Readonly<
  Record<PositionGroup, Partial<Record<MetricKey, number>>>
> = {
  PITCHER: { pitchingVelocity: 1 },
  CATCHER: { exitVelocity: 0.5, popTime: 0.4, sixtyYardDash: 0.1 },
  MIDDLE_INFIELD: { exitVelocity: 0.4, infieldVelocity: 0.35, sixtyYardDash: 0.25 },
  CORNER_INFIELD: { exitVelocity: 0.6, infieldVelocity: 0.3, sixtyYardDash: 0.1 },
  OUTFIELD: { exitVelocity: 0.45, outfieldVelocity: 0.3, sixtyYardDash: 0.25 },
  BAT_ONLY: { exitVelocity: 1 },
};

export function positionGroup(pos: Position): PositionGroup {
  switch (pos) {
    case 'P': return 'PITCHER';
    case 'C': return 'CATCHER';
    case 'SS':
    case '2B': return 'MIDDLE_INFIELD';
    case '1B':
    case '3B': return 'CORNER_INFIELD';
    case 'LF':
    case 'CF':
    case 'RF':
    case 'OF': return 'OUTFIELD';
    case 'DH':
    case 'UTIL':
    default: return 'BAT_ONLY';
  }
}

type DivisionBenchmarks = Readonly<Record<MetricKey, MetricAnchor>>;

/**
 * Per-division metric anchors. A given position only *uses* the metrics listed
 * in GROUP_METRIC_WEIGHTS, but anchors are defined once per division.
 */
export const BENCHMARKS: Readonly<Record<Division, DivisionBenchmarks>> = {
  D1: {
    pitchingVelocity: { floor: 85, good: 92 },
    exitVelocity: { floor: 88, good: 96 },
    sixtyYardDash: { floor: 7.1, good: 6.6 },
    infieldVelocity: { floor: 80, good: 88 },
    outfieldVelocity: { floor: 84, good: 92 },
    popTime: { floor: 2.05, good: 1.9 },
  },
  D2: {
    pitchingVelocity: { floor: 82, good: 88 },
    exitVelocity: { floor: 85, good: 92 },
    sixtyYardDash: { floor: 7.3, good: 6.8 },
    infieldVelocity: { floor: 77, good: 84 },
    outfieldVelocity: { floor: 80, good: 88 },
    popTime: { floor: 2.1, good: 1.98 },
  },
  NAIA: {
    pitchingVelocity: { floor: 81, good: 87 },
    exitVelocity: { floor: 84, good: 91 },
    sixtyYardDash: { floor: 7.35, good: 6.85 },
    infieldVelocity: { floor: 76, good: 83 },
    outfieldVelocity: { floor: 79, good: 87 },
    popTime: { floor: 2.12, good: 2.0 },
  },
  JUCO: {
    pitchingVelocity: { floor: 80, good: 87 },
    exitVelocity: { floor: 83, good: 91 },
    sixtyYardDash: { floor: 7.4, good: 6.85 },
    infieldVelocity: { floor: 75, good: 83 },
    outfieldVelocity: { floor: 78, good: 87 },
    popTime: { floor: 2.13, good: 2.0 },
  },
  D3: {
    pitchingVelocity: { floor: 78, good: 85 },
    exitVelocity: { floor: 82, good: 89 },
    sixtyYardDash: { floor: 7.5, good: 7.0 },
    infieldVelocity: { floor: 74, good: 81 },
    outfieldVelocity: { floor: 77, good: 85 },
    popTime: { floor: 2.18, good: 2.05 },
  },
};

/** Rough academic emphasis by division (0–1), used to weight academic fit. */
export const ACADEMIC_EMPHASIS: Readonly<Record<Division, number>> = {
  D3: 0.9,
  D1: 0.55,
  D2: 0.5,
  NAIA: 0.45,
  JUCO: 0.35,
};

/** Whether a division can offer athletic scholarships at all. */
export const OFFERS_ATHLETIC_AID: Readonly<Record<Division, boolean>> = {
  D1: true,
  D2: true,
  NAIA: true,
  JUCO: true,
  D3: false, // D3 offers no athletic scholarships (academic/need aid only)
};
