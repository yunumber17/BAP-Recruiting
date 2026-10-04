/**
 * Coach Match — how well the player satisfies the coach's stated preferences
 * (position, handedness needs, metric thresholds, academic emphasis). This is a
 * proxy for "coach interest probability".
 */
import type { Player, School, ComponentScore, Position } from '../types.js';
import { clamp } from '../util.js';

function inPositionPool(pos: Position, player: Player): boolean {
  const of: Position[] = ['OF', 'LF', 'CF', 'RF'];
  const pool = [player.primaryPosition, player.secondaryPosition].filter(Boolean) as Position[];
  if (pool.includes(pos)) return true;
  if (of.includes(pos) && pool.some((p) => of.includes(p))) return true;
  return false;
}

export function scoreCoachMatch(player: Player, school: School): ComponentScore {
  const prefs = school.coachPreferences;
  const notes: string[] = [];

  if (!prefs) {
    return {
      key: 'coachMatch',
      label: 'コーチ適合',
      score: 60,
      weight: 0,
      confidence: 20,
      notes: ['コーチの嗜好情報なし（中立評価）'],
    };
  }

  const signals: number[] = [];

  if (prefs.positions && prefs.positions.length) {
    signals.push(prefs.positions.some((p) => inPositionPool(p, player)) ? 92 : 40);
  }
  if (prefs.preferredThrows) {
    signals.push(prefs.preferredThrows === player.throws ? 90 : 55);
    if (prefs.preferredThrows === player.throws && player.throws === 'L') {
      notes.push('左投げの需要に合致');
    }
  }
  if (prefs.preferredBats) {
    signals.push(prefs.preferredBats === player.bats ? 85 : 60);
  }
  if (prefs.minGpa !== undefined) {
    signals.push(player.gpa >= prefs.minGpa ? 88 : 45);
  }
  if (prefs.minExitVelocity !== undefined && player.exitVelocity !== undefined) {
    signals.push(player.exitVelocity >= prefs.minExitVelocity ? 90 : 42);
  }
  if (prefs.minPitchingVelocity !== undefined && player.pitchingVelocity !== undefined) {
    signals.push(player.pitchingVelocity >= prefs.minPitchingVelocity ? 92 : 40);
  }

  let score = signals.length ? signals.reduce((a, b) => a + b, 0) / signals.length : 60;

  // Emphasis skew: an academics-first coach rewards strong students.
  if (prefs.prioritizeAcademics && player.gpa >= 3.5) score = clamp(score + 5);
  if (prefs.prioritizeAthletics) {
    const hasBigTool =
      (player.exitVelocity ?? 0) >= 92 || (player.pitchingVelocity ?? 0) >= 90;
    if (hasBigTool) score = clamp(score + 5);
  }

  if (score >= 85) notes.push('コーチの求める要件に強く合致');
  else if (score < 50) notes.push('コーチの要件と差があり、他の強みで補う必要');

  // Confidence: how many preference dimensions we could actually evaluate.
  const declared = [
    prefs.positions, prefs.preferredThrows, prefs.preferredBats,
    prefs.minGpa, prefs.minExitVelocity, prefs.minPitchingVelocity,
  ].filter((v) => v !== undefined).length;
  const confidence = clamp((declared / 6) * 100);

  return {
    key: 'coachMatch',
    label: 'コーチ適合',
    score: clamp(score),
    weight: 0,
    confidence,
    notes,
  };
}
