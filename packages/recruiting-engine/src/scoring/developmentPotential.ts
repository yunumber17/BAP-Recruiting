/**
 * Development Potential — upside beyond the current snapshot. Younger class,
 * projectable frame, and being *close but not yet at* the benchmark all signal
 * room to grow. Showcases/awards indicate exposure and competitiveness.
 */
import type { Player, School, ComponentScore } from '../types.js';
import { BENCHMARKS, GROUP_METRIC_WEIGHTS, positionGroup, type MetricKey } from '../benchmarks.js';
import { clamp, completeness, scaleMetric } from '../util.js';

const playerMetric = (p: Player, k: MetricKey): number | undefined => ({
  pitchingVelocity: p.pitchingVelocity,
  exitVelocity: p.exitVelocity,
  sixtyYardDash: p.sixtyYardDash,
  infieldVelocity: p.infieldVelocity,
  outfieldVelocity: p.outfieldVelocity,
  popTime: p.popTime,
}[k]);

export function scoreDevelopmentPotential(
  player: Player,
  school: School,
  currentYear: number = new Date().getFullYear(),
): ComponentScore {
  const notes: string[] = [];
  let score = 50;

  // 1) Time horizon: more years to graduation → more projection.
  const yearsOut = clamp(player.graduationYear - currentYear, 0, 4);
  score += yearsOut * 6; // 0y → +0, 4y → +24
  if (yearsOut >= 3) notes.push('学年が若く、伸びしろが大きい');

  // 2) Frame projectability: room to add mass on a tall frame.
  if (player.heightInches >= 73 && player.weightLbs < 195) {
    score += 8;
    notes.push('体格に対して増量余地があり将来性');
  } else if (player.heightInches < 70 && player.weightLbs < 170) {
    score += 2;
  }

  // 3) "Close to the bar" bonus: near benchmark but not over → trending up.
  const group = positionGroup(player.primaryPosition);
  const anchors = BENCHMARKS[school.division];
  const gw = GROUP_METRIC_WEIGHTS[group];
  const metricScores: number[] = [];
  for (const key of Object.keys(gw) as MetricKey[]) {
    const raw = playerMetric(player, key);
    if (raw === undefined) continue;
    metricScores.push(scaleMetric(raw, anchors[key].floor, anchors[key].good));
  }
  if (metricScores.length) {
    const avg = metricScores.reduce((a, b) => a + b, 0) / metricScores.length;
    if (avg >= 45 && avg < 75) {
      score += 6; // knocking on the door
      notes.push('基準に近く、あと少しで到達');
    } else if (avg >= 90) {
      score += 2; // already elite; less "upside" but still positive
    }
  }

  // 4) Exposure: showcases + awards.
  const showcases = player.showcases?.length ?? 0;
  const awards = player.awards?.length ?? 0;
  if (showcases >= 2) { score += 4; notes.push('複数のショーケース参加で露出あり'); }
  if (awards >= 2) score += 3;

  const confidence = completeness([
    player.graduationYear, player.heightInches, player.weightLbs,
    player.showcases, player.awards,
  ]);

  return {
    key: 'developmentPotential',
    label: '成長ポテンシャル',
    score: clamp(score),
    weight: 0,
    confidence,
    notes,
  };
}
