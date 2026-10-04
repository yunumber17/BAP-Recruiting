/**
 * RecruitingScoreEngine — orchestrates the seven components into a single
 * RecruitingScore with grade, confidence, and Reach/Target/Safety.
 */
import type {
  Player, School, ScoringConfig, RecruitingScore, ComponentScore,
  ComponentKey, Breakdown, Classification,
} from './types.js';
import { resolveConfig } from './config.js';
import { ACADEMIC_EMPHASIS } from './benchmarks.js';
import { clamp, letterGrade, round } from './util.js';

import { scoreAthleticFit } from './scoring/athleticFit.js';
import { scoreAcademicFit } from './scoring/academicFit.js';
import { scoreRosterOpportunity } from './scoring/rosterOpportunity.js';
import { scoreScholarshipPotential } from './scoring/scholarshipPotential.js';
import { scoreGeographicFit } from './scoring/geographicFit.js';
import { scoreCoachMatch } from './scoring/coachMatch.js';
import { scoreDevelopmentPotential } from './scoring/developmentPotential.js';

export class RecruitingScoreEngine {
  private readonly config: ScoringConfig;

  constructor(config?: Partial<ScoringConfig>) {
    this.config = resolveConfig(config);
  }

  /** Score a single player against a single school. Pure + deterministic. */
  public score(player: Player, school: School): RecruitingScore {
    const components = this.runComponents(player, school);

    // Division-aware weight adjustment: academic divisions lean on academics.
    const weights = this.effectiveWeights(school);
    const weighted = this.applyWeights(components, weights);

    const overall = round(this.combine(weighted), 1);
    const confidence = round(this.combineConfidence(weighted), 0);
    const classification = this.classify(weighted);
    const breakdown = this.toBreakdown(weighted);
    const summary = this.buildSummary(overall, confidence, classification, breakdown);

    return {
      overall,
      grade: letterGrade(overall),
      confidence,
      classification,
      breakdown,
      summary,
    };
  }

  /** Score one player against many schools, sorted best-fit first. */
  public rank(
    player: Player,
    schools: readonly School[],
  ): ReadonlyArray<{ school: School; result: RecruitingScore }> {
    return schools
      .map((school) => ({ school, result: this.score(player, school) }))
      .sort((a, b) => b.result.overall - a.result.overall);
  }

  // ── internals ──────────────────────────────────────────────────────────────

  private runComponents(player: Player, school: School): ComponentScore[] {
    return [
      scoreAthleticFit(player, school),
      scoreAcademicFit(player, school),
      scoreRosterOpportunity(player, school),
      scoreScholarshipPotential(player, school),
      scoreGeographicFit(player, school),
      scoreCoachMatch(player, school),
      scoreDevelopmentPotential(player, school),
    ];
  }

  private effectiveWeights(school: School): Record<ComponentKey, number> {
    const w = { ...this.config.weights };
    const emphasis = ACADEMIC_EMPHASIS[school.division]; // 0.35–0.9
    // Shift weight between athletic and academic based on division emphasis,
    // keeping their combined weight constant.
    const combined = w.athleticFit + w.academicFit;
    w.academicFit = combined * emphasis;
    w.athleticFit = combined * (1 - emphasis);
    return w;
  }

  private applyWeights(
    components: ComponentScore[],
    weights: Record<ComponentKey, number>,
  ): ComponentScore[] {
    return components.map((c) => ({ ...c, weight: weights[c.key] ?? 0 }));
  }

  private combine(components: ComponentScore[]): number {
    let num = 0;
    let den = 0;
    for (const c of components) {
      num += c.score * c.weight;
      den += c.weight;
    }
    return den === 0 ? 0 : clamp(num / den);
  }

  /** Overall confidence = weight-blended component confidence. */
  private combineConfidence(components: ComponentScore[]): number {
    let num = 0;
    let den = 0;
    for (const c of components) {
      num += c.confidence * c.weight;
      den += c.weight;
    }
    return den === 0 ? 0 : clamp(num / den);
  }

  /**
   * Reach / Target / Safety from the athletic+academic "fit" blend — the two
   * components that describe whether the player can play and get in.
   */
  private classify(components: ComponentScore[]): Classification {
    const byKey = Object.fromEntries(components.map((c) => [c.key, c])) as Record<
      ComponentKey, ComponentScore
    >;
    const fit = 0.6 * byKey.athleticFit.score + 0.4 * byKey.academicFit.score;
    const { safety, target } = this.config.classification;
    if (fit >= safety) return 'Safety';
    if (fit >= target) return 'Target';
    return 'Reach';
  }

  private toBreakdown(components: ComponentScore[]): Breakdown {
    return Object.fromEntries(
      components.map((c) => [c.key, { ...c, score: round(c.score, 1), confidence: round(c.confidence, 0) }]),
    ) as Breakdown;
  }

  private buildSummary(
    overall: number,
    confidence: number,
    classification: Classification,
    breakdown: Breakdown,
  ): string[] {
    const out: string[] = [];
    const label =
      classification === 'Safety' ? '有力候補（Safety）'
      : classification === 'Target' ? '現実的な目標（Target）'
      : 'チャレンジ（Reach）';
    out.push(`総合${overall}点 / ${label}`);

    const ranked = Object.values(breakdown).slice().sort((a, b) => b.score - a.score);
    const strengths = ranked.filter((c) => c.score >= 80).slice(0, 2);
    const gaps = ranked.filter((c) => c.score < 55).slice(-2);

    if (strengths.length) out.push('強み: ' + strengths.map((c) => c.label).join('、'));
    if (gaps.length) out.push('改善点: ' + gaps.map((c) => c.label).join('、'));

    if (confidence < this.config.lowConfidenceThreshold) {
      out.push('データが不足しています。指標・学業情報を追加すると精度が上がります。');
    }
    return out;
  }
}

/** Convenience one-shot API. */
export function scoreRecruit(
  player: Player,
  school: School,
  config?: Partial<ScoringConfig>,
): RecruitingScore {
  return new RecruitingScoreEngine(config).score(player, school);
}
