/**
 * Scholarship Potential — likelihood of meaningful athletic aid. Gated by
 * division (D3 offers none), driven by how far the player exceeds the division
 * bar, and whether the school flags aid available.
 */
import type { Player, School, ComponentScore } from '../types.js';
import { OFFERS_ATHLETIC_AID } from '../benchmarks.js';
import { clamp, completeness } from '../util.js';
import { scoreAthleticFit } from './athleticFit.js';

export function scoreScholarshipPotential(player: Player, school: School): ComponentScore {
  const notes: string[] = [];

  if (!OFFERS_ATHLETIC_AID[school.division]) {
    notes.push('D3は競技奨学金なし（学業・need-based支援のみ）');
    // Academic aid can still exist; give a modest floor tied to GPA.
    const academic = clamp(30 + (player.gpa - 3) * 20);
    return {
      key: 'scholarshipPotential',
      label: '奨学金可能性',
      score: clamp(academic, 0, 55),
      weight: 0,
      confidence: completeness([player.gpa]),
      notes,
    };
  }

  // Athletic aid scales with how much the player beats the division bar.
  const athletic = scoreAthleticFit(player, school).score; // 0–100 vs this division
  let score = clamp(20 + (athletic - 50) * 1.4); // 50→20, 90→76, 100→90

  if (school.scholarshipAvailable === false) {
    score = clamp(score - 25);
    notes.push('この学校は奨学金枠が限定的');
  } else if (school.scholarshipAvailable === true) {
    score = clamp(score + 6);
  }

  // JUCO/NAIA tend to have more flexible aid for strong players.
  if ((school.division === 'JUCO' || school.division === 'NAIA') && athletic >= 70) {
    score = clamp(score + 6);
  }

  if (score >= 75) notes.push('好条件のオファーが期待できる');
  else if (score < 35) notes.push('競技奨学金は厳しめ、学業支援も検討');

  return {
    key: 'scholarshipPotential',
    label: '奨学金可能性',
    score: clamp(score),
    weight: 0,
    confidence: completeness([player.exitVelocity ?? player.pitchingVelocity, school.scholarshipAvailable]),
    notes,
  };
}
