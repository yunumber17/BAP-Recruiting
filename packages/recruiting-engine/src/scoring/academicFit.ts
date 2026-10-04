/**
 * Academic Fit — does the player clear the school's academic bar, and how does
 * their profile compare to the school's typical student. Weighted more heavily
 * for academic divisions (see ACADEMIC_EMPHASIS).
 */
import type { Player, School, ComponentScore } from '../types.js';
import { clamp, completeness, scaleMetric } from '../util.js';

export function scoreAcademicFit(player: Player, school: School): ComponentScore {
  const notes: string[] = [];
  const req = school.academicRequirements;
  const prof = school.academicProfile;

  // 1) GPA sub-score against requirement (hard gate) and average (fit).
  const gpaScore = gpaSubScore(player.gpa, req?.minGpa, prof?.avgGpa, notes);

  // 2) Test-score sub-score (SAT preferred, else ACT). Optional.
  const testScore = testSubScore(player, req, prof, notes);

  // Blend: GPA is the backbone; tests refine when present.
  let score: number;
  if (testScore === undefined) {
    score = gpaScore;
  } else {
    score = 0.65 * gpaScore + 0.35 * testScore;
  }

  // Acceptance-rate context: very selective schools raise the bar slightly.
  if (school.acceptanceRate !== undefined && school.acceptanceRate < 0.25) {
    score = clamp(score - 6);
    notes.push('難関校のため学業基準はよりシビア');
  }

  const confidence = completeness([
    player.gpa,
    player.sat ?? player.act,
    req?.minGpa ?? prof?.avgGpa,
  ]);

  return {
    key: 'academicFit',
    label: '学業適合',
    score: clamp(score),
    weight: 0,
    confidence,
    notes,
  };
}

function gpaSubScore(
  gpa: number,
  minGpa: number | undefined,
  avgGpa: number | undefined,
  notes: string[],
): number {
  if (gpa === undefined || Number.isNaN(gpa)) return 50;
  // Requirement gate.
  if (minGpa !== undefined && gpa < minGpa) {
    notes.push(`GPAが最低基準(${minGpa})未満`);
    // Partial credit proportional to how close they are.
    return clamp((gpa / minGpa) * 45);
  }
  // Fit against the school's average student.
  if (avgGpa !== undefined) {
    // avgGpa maps to ~75; +0.4 above → ~95; -0.4 below → ~55.
    return scaleMetric(gpa, avgGpa - 0.4, avgGpa + 0.4) + 10;
  }
  // No school data: reward absolute strength on a 4.0 scale.
  return clamp(scaleMetric(gpa, 2.5, 3.8) + 5);
}

function testSubScore(
  player: Player,
  req: School['academicRequirements'],
  prof: School['academicProfile'],
  notes: string[],
): number | undefined {
  if (player.sat !== undefined) {
    if (req?.minSat !== undefined && player.sat < req.minSat) {
      notes.push(`SATが最低基準(${req.minSat})未満`);
      return clamp((player.sat / req.minSat) * 45);
    }
    const avg = prof?.avgSat ?? req?.minSat;
    if (avg !== undefined) return scaleMetric(player.sat, avg - 150, avg + 150) + 5;
    return scaleMetric(player.sat, 950, 1350);
  }
  if (player.act !== undefined) {
    if (req?.minAct !== undefined && player.act < req.minAct) {
      notes.push(`ACTが最低基準(${req.minAct})未満`);
      return clamp((player.act / req.minAct) * 45);
    }
    const avg = prof?.avgAct ?? req?.minAct;
    if (avg !== undefined) return scaleMetric(player.act, avg - 4, avg + 4) + 5;
    return scaleMetric(player.act, 19, 30);
  }
  return undefined;
}
