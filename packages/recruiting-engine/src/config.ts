/** Default, override-able scoring configuration. */
import type { ScoringConfig, ComponentWeights } from './types.js';

export const DEFAULT_WEIGHTS: ComponentWeights = {
  athleticFit: 0.30,
  academicFit: 0.18,
  rosterOpportunity: 0.14,
  coachMatch: 0.13,
  scholarshipPotential: 0.10,
  developmentPotential: 0.09,
  geographicFit: 0.06,
};

export const DEFAULT_CONFIG: ScoringConfig = {
  weights: DEFAULT_WEIGHTS,
  classification: { safety: 72, target: 55 },
  lowConfidenceThreshold: 55,
};

/** Merge a partial override onto the defaults (shallow, with nested weights). */
export function resolveConfig(override?: Partial<ScoringConfig>): ScoringConfig {
  if (!override) return DEFAULT_CONFIG;
  return {
    weights: { ...DEFAULT_WEIGHTS, ...(override.weights ?? {}) },
    classification: { ...DEFAULT_CONFIG.classification, ...(override.classification ?? {}) },
    lowConfidenceThreshold:
      override.lowConfidenceThreshold ?? DEFAULT_CONFIG.lowConfidenceThreshold,
  };
}
