/** Public API surface for the BAP Recruiting Score Engine. */
export * from './types.js';
export { RecruitingScoreEngine, scoreRecruit } from './engine.js';
export { DEFAULT_CONFIG, DEFAULT_WEIGHTS, resolveConfig } from './config.js';
export {
  BENCHMARKS, ACADEMIC_EMPHASIS, OFFERS_ATHLETIC_AID, positionGroup,
  GROUP_METRIC_WEIGHTS,
} from './benchmarks.js';

// Individual scorers are exported for testing / advanced composition.
export { scoreAthleticFit } from './scoring/athleticFit.js';
export { scoreAcademicFit } from './scoring/academicFit.js';
export { scoreRosterOpportunity } from './scoring/rosterOpportunity.js';
export { scoreScholarshipPotential } from './scoring/scholarshipPotential.js';
export { scoreGeographicFit } from './scoring/geographicFit.js';
export { scoreCoachMatch } from './scoring/coachMatch.js';
export { scoreDevelopmentPotential } from './scoring/developmentPotential.js';
