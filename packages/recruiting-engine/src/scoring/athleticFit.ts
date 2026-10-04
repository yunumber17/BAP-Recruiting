/**
 * Athletic Fit — how the player's measurables compare to the division/position
 * benchmark. This is the heaviest component.
 */
import type { Player, School, ComponentScore } from '../types.js';
import {
  BENCHMARKS, GROUP_METRIC_WEIGHTS, positionGroup, type MetricKey,
} from '../benchmarks.js';
import { clamp, scaleMetric, weightedMean } from '../util.js';

const METRIC_LABEL: Record<MetricKey, string> = {
  pitchingVelocity: '球速',
  exitVelocity: '打球初速',
  sixtyYardDash: '60ヤード走',
  infieldVelocity: '内野送球',
  outfieldVelocity: '外野送球',
  popTime: 'ポップタイム',
};

const playerMetric = (p: Player, k: MetricKey): number | undefined => {
  switch (k) {
    case 'pitchingVelocity': return p.pitchingVelocity;
    case 'exitVelocity': return p.exitVelocity;
    case 'sixtyYardDash': return p.sixtyYardDash;
    case 'infieldVelocity': return p.infieldVelocity;
    case 'outfieldVelocity': return p.outfieldVelocity;
    case 'popTime': return p.popTime;
  }
};

export function scoreAthleticFit(player: Player, school: School): ComponentScore {
  const group = positionGroup(player.primaryPosition);
  const metricWeights = GROUP_METRIC_WEIGHTS[group];
  const anchors = BENCHMARKS[school.division];
  const notes: string[] = [];

  const parts: Array<{ value: number | undefined; weight: number }> = [];
  let present = 0;
  let total = 0;

  for (const key of Object.keys(metricWeights) as MetricKey[]) {
    const w = metricWeights[key] ?? 0;
    if (w <= 0) continue;
    total += 1;
    const raw = playerMetric(player, key);
    if (raw === undefined) {
      notes.push(`${METRIC_LABEL[key]}が未入力（評価精度が下がります）`);
      parts.push({ value: undefined, weight: w });
      continue;
    }
    present += 1;
    const anchor = anchors[key];
    const s = scaleMetric(raw, anchor.floor, anchor.good);
    parts.push({ value: s, weight: w });
    if (s >= 90) notes.push(`${METRIC_LABEL[key]}は${school.division}水準で強み`);
    else if (s < 50) notes.push(`${METRIC_LABEL[key]}は${school.division}水準に対して要改善`);
  }

  let score = weightedMean(parts);

  // Physical projectability nudge: size relative to a generic frame.
  const frame = frameBonus(player);
  score = clamp(score + frame.delta);
  if (frame.note) notes.push(frame.note);

  const confidence = total === 0 ? 0 : clamp((present / total) * 100);
  if (present === 0) notes.push('測定値が無いため、身体データのみで暫定評価しています');

  return {
    key: 'athleticFit',
    label: 'アスレチック適合',
    score: clamp(score),
    weight: 0, // set by the engine
    confidence,
    notes,
  };
}

/** Small +/- for size vs a nominal projectable frame (6'1" / 185 lb). */
function frameBonus(player: Player): { delta: number; note?: string } {
  const idealH = 73; // inches
  const idealW = 185;
  const h = player.heightInches;
  const w = player.weightLbs;
  if (!h || !w) return { delta: 0 };
  const hDelta = (h - idealH) * 0.8;          // taller → slight plus
  const wDelta = (w - idealW) * 0.02;          // heavier (to a point) → slight plus
  const delta = clamp(hDelta + wDelta, -4, 4);
  if (delta >= 3) return { delta, note: '身体の作りに将来性あり' };
  if (delta <= -3) return { delta, note: '線が細く、増量で評価が上がる余地あり' };
  return { delta };
}
