export interface Summary {
  readonly n: number;
  readonly mean: number | null;
  readonly median: number | null;
  readonly min: number | null;
  readonly max: number | null;
  readonly stdev: number | null;
}

export function describe(values: readonly (number | null)[]): Summary {
  const xs = values.filter((v): v is number => v != null && Number.isFinite(v));
  const n = xs.length;
  if (n === 0) return { n: 0, mean: null, median: null, min: null, max: null, stdev: null };
  const sorted = [...xs].sort((a, b) => a - b);
  const sum = xs.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 ? ((sorted[mid - 1]! + sorted[mid]!) / 2) : sorted[mid]!;
  const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  return {
    n,
    mean: round(mean),
    median: round(median),
    min: sorted[0]!,
    max: sorted[n - 1]!,
    stdev: round(Math.sqrt(variance)),
  };
}

// Simple IQR-based outlier bounds (Tukey fences, k=3 for "far" outliers).
export function outlierBounds(values: readonly (number | null)[], k = 3): { lo: number; hi: number } | null {
  const xs = values.filter((v): v is number => v != null && Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length < 4) return null;
  const q = (p: number): number => {
    const idx = (xs.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return xs[lo]! + (xs[hi]! - xs[lo]!) * (idx - lo);
  };
  const q1 = q(0.25);
  const q3 = q(0.75);
  const iqr = q3 - q1;
  return { lo: q1 - k * iqr, hi: q3 + k * iqr };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
