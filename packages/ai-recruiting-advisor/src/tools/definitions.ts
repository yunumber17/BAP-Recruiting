import { z } from 'zod';
import type { Tool } from './Tool.js';
import type { PlayerContext } from '../context/providers.js';
import { NotIntegratedError } from '../models/errors.js';

/**
 * FindImprovementAreas — a fully-implemented, deterministic tool. It ranks the
 * player's weakest measurables against simple position-agnostic targets. No LLM,
 * no external package. Advisors can call it to ground their advice.
 */
const ImprovementInput = z.object({ topN: z.number().int().min(1).max(10).default(3) });
type ImprovementInput = z.infer<typeof ImprovementInput>;
export interface ImprovementArea {
  metric: string;
  value: number;
  target: number;
  gap: number;
}

const TARGETS: Record<string, { target: number; lowerBetter?: boolean }> = {
  EXIT_VELOCITY: { target: 92 },
  PITCHING_VELOCITY: { target: 88 },
  INFIELD_VELOCITY: { target: 85 },
  OUTFIELD_VELOCITY: { target: 88 },
  SIXTY_YARD_DASH: { target: 6.8, lowerBetter: true },
  POP_TIME: { target: 1.95, lowerBetter: true },
};

export const findImprovementAreasTool: Tool<ImprovementInput, ImprovementArea[]> = {
  name: 'FindImprovementAreas',
  description: 'Rank the player\'s weakest measurables vs. general benchmarks.',
  inputSchema: ImprovementInput,
  async execute(input, context: PlayerContext): Promise<ImprovementArea[]> {
    const metrics = context.metrics ?? [];
    const areas: ImprovementArea[] = [];
    for (const m of metrics) {
      const t = TARGETS[m.type];
      if (!t) continue;
      const gap = t.lowerBetter ? m.value - t.target : t.target - m.value;
      if (gap > 0) areas.push({ metric: m.type, value: m.value, target: t.target, gap: round(gap) });
    }
    return areas.sort((a, b) => b.gap - a.gap).slice(0, input.topN);
  },
};

/**
 * ExplainRecruitingScore — DECLARED but not integrated. It will call the
 * Recruiting Score Engine later; today it throws NotIntegrated so callers get a
 * clear signal instead of a fabricated number.
 */
const ExplainInput = z.object({ schoolId: z.string() });
export const explainRecruitingScoreTool: Tool<z.infer<typeof ExplainInput>, never> = {
  name: 'ExplainRecruitingScore',
  description: 'Explain a player\'s fit score for a school (requires the score engine).',
  inputSchema: ExplainInput,
  async execute(): Promise<never> {
    throw new NotIntegratedError('ExplainRecruitingScore requires the Recruiting Score Engine (not wired yet).');
  },
};

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
