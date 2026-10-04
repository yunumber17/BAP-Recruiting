/**
 * Roster Opportunity — is the school actually looking for this position, and is
 * there realistic room on the roster / in the incoming class.
 */
import type { Player, School, ComponentScore, Position } from '../types.js';
import { clamp, completeness } from '../util.js';

/** Positions that satisfy a listed need (OF covers LF/CF/RF and vice-versa). */
function positionMatches(need: Position, player: Player): boolean {
  const outfield: Position[] = ['OF', 'LF', 'CF', 'RF'];
  const pool = new Set<Position>([player.primaryPosition, player.secondaryPosition].filter(
    (p): p is Position => !!p,
  ));
  if (pool.has(need)) return true;
  if (outfield.includes(need) && [...pool].some((p) => outfield.includes(p))) return true;
  return false;
}

export function scoreRosterOpportunity(player: Player, school: School): ComponentScore {
  const notes: string[] = [];
  let score = 60; // neutral baseline

  const needs = school.recruitingNeeds;
  if (needs && needs.length > 0) {
    if (needs.some((n) => positionMatches(n, player))) {
      score = 90;
      notes.push('募集ポジションに合致');
    } else {
      score = 38;
      notes.push('現在の募集ポジションと不一致');
    }
  } else {
    notes.push('募集ニーズ情報なし（中立評価）');
  }

  // Coach position preference reinforces/undermines.
  const prefs = school.coachPreferences?.positions;
  if (prefs && prefs.length > 0) {
    if (prefs.some((n) => positionMatches(n, player))) score = clamp(score + 6);
    else score = clamp(score - 6);
  }

  // Incoming class / roster size: bigger intake → more room.
  if (school.incomingClassSize !== undefined) {
    if (school.incomingClassSize >= 12) score = clamp(score + 5);
    else if (school.incomingClassSize <= 5) {
      score = clamp(score - 6);
      notes.push('採用枠が少なく競争が激しい');
    }
  } else if (school.rosterSize !== undefined && school.rosterSize < 30) {
    score = clamp(score - 3);
  }

  const confidence = completeness([
    school.recruitingNeeds,
    school.coachPreferences?.positions,
    school.incomingClassSize ?? school.rosterSize,
  ]);

  return {
    key: 'rosterOpportunity',
    label: '起用機会',
    score: clamp(score),
    weight: 0,
    confidence,
    notes,
  };
}
