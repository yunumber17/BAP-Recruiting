/**
 * BAP Recruiting Score Engine — domain model.
 *
 * All inputs and outputs are fully typed. Optional fields are genuinely
 * optional: the engine lowers `confidence` when data is missing rather than
 * failing, so a partially-filled player still gets a usable score.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enums / unions
// ─────────────────────────────────────────────────────────────────────────────

export type Division = 'D1' | 'D2' | 'D3' | 'NAIA' | 'JUCO';

export type Position =
  | 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'OF' | 'DH' | 'UTIL';

export type Hand = 'R' | 'L';
export type BattingSide = 'R' | 'L' | 'S';

export type Classification = 'Reach' | 'Target' | 'Safety';

export type LetterGrade =
  | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F';

/** The seven scored components. */
export type ComponentKey =
  | 'academicFit'
  | 'athleticFit'
  | 'rosterOpportunity'
  | 'scholarshipPotential'
  | 'geographicFit'
  | 'coachMatch'
  | 'developmentPotential';

// ─────────────────────────────────────────────────────────────────────────────
// Player
// ─────────────────────────────────────────────────────────────────────────────

export interface BattingStats {
  readonly avg?: number;   // batting average, 0–1
  readonly obp?: number;   // on-base %, 0–1
  readonly slg?: number;   // slugging, 0–~1.5
  readonly ops?: number;   // on-base plus slugging
  readonly homeRuns?: number;
  readonly stolenBases?: number;
  readonly strikeoutRate?: number; // K%, 0–1 (lower is better)
}

export interface PitchingStats {
  readonly era?: number;   // earned run average (lower better)
  readonly whip?: number;  // walks+hits per inning (lower better)
  readonly k9?: number;    // strikeouts per 9
  readonly bb9?: number;   // walks per 9 (lower better)
  readonly inningsPitched?: number;
}

export interface GeoPoint {
  readonly state: string;          // 2-letter US code, e.g. "CA"
  readonly region?: Region;        // optional; derived from state if absent
  readonly lat?: number;
  readonly lng?: number;
}

export type Region = 'West' | 'Midwest' | 'South' | 'Northeast';

export interface Player {
  readonly graduationYear: number;
  readonly gpa: number;                 // unweighted or weighted; 0–5.33
  readonly sat?: number;                // 400–1600
  readonly act?: number;                // 1–36

  readonly primaryPosition: Position;
  readonly secondaryPosition?: Position;

  readonly heightInches: number;
  readonly weightLbs: number;
  readonly throws: Hand;
  readonly bats: BattingSide;

  // Athletic measurables (mph / seconds). All optional.
  readonly exitVelocity?: number;       // mph
  readonly pitchingVelocity?: number;   // mph (fastball)
  readonly popTime?: number;            // seconds (catchers, lower better)
  readonly sixtyYardDash?: number;      // seconds (lower better)
  readonly infieldVelocity?: number;    // mph
  readonly outfieldVelocity?: number;   // mph

  readonly battingStats?: BattingStats;
  readonly pitchingStats?: PitchingStats;

  readonly awards?: readonly string[];
  readonly showcases?: readonly string[]; // events attended
  readonly location?: GeoPoint;
  readonly preferredRegions?: readonly Region[];
  readonly maxTuition?: number;           // affordability ceiling (USD/yr)
}

// ─────────────────────────────────────────────────────────────────────────────
// School
// ─────────────────────────────────────────────────────────────────────────────

export interface AcademicProfile {
  readonly avgGpa?: number;
  readonly avgSat?: number;
  readonly avgAct?: number;
}

export interface AcademicRequirements {
  readonly minGpa?: number;
  readonly minSat?: number;
  readonly minAct?: number;
}

export interface CoachPreferences {
  readonly positions?: readonly Position[];   // positions the coach favors
  readonly minExitVelocity?: number;
  readonly minPitchingVelocity?: number;
  readonly minGpa?: number;
  readonly prioritizeAcademics?: boolean;
  readonly prioritizeAthletics?: boolean;
  readonly preferredThrows?: Hand;            // e.g. needs a lefty
  readonly preferredBats?: BattingSide;
}

export interface School {
  readonly id?: number | string;
  readonly name?: string;
  readonly division: Division;
  readonly conference?: string;

  readonly acceptanceRate?: number;   // 0–1
  readonly enrollment?: number;
  readonly tuition?: number;          // USD / year
  readonly rosterSize?: number;
  readonly incomingClassSize?: number; // recruits taken per year

  readonly academicProfile?: AcademicProfile;
  readonly academicRequirements?: AcademicRequirements;
  readonly coachPreferences?: CoachPreferences;
  readonly recruitingNeeds?: readonly Position[]; // positions actively recruited

  readonly location?: GeoPoint;
  readonly scholarshipAvailable?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

/** One scored component. `score` and `confidence` are 0–100. */
export interface ComponentScore {
  readonly key: ComponentKey;
  readonly label: string;
  readonly score: number;      // 0–100
  readonly weight: number;     // relative weight used in the overall
  readonly confidence: number; // 0–100, based on data completeness
  readonly notes: readonly string[];
}

export type Breakdown = Readonly<Record<ComponentKey, ComponentScore>>;

export interface RecruitingScore {
  readonly overall: number;              // 0–100 weighted
  readonly grade: LetterGrade;
  readonly confidence: number;           // 0–100 overall confidence
  readonly classification: Classification; // Reach / Target / Safety
  readonly breakdown: Breakdown;
  readonly summary: readonly string[];   // human-readable guidance
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

/** Relative weights for the seven components. Need not sum to 1 (normalized). */
export type ComponentWeights = Readonly<Record<ComponentKey, number>>;

export interface ScoringConfig {
  /** Component weights (normalized internally). */
  readonly weights: ComponentWeights;
  /**
   * Classification thresholds on the *fit* signal (0–100 blend of academic +
   * athletic fit). >= safety → Safety; >= target → Target; else Reach.
   */
  readonly classification: {
    readonly safety: number;
    readonly target: number;
  };
  /**
   * Minimum confidence (0–100) below which a warning is added to the summary.
   */
  readonly lowConfidenceThreshold: number;
}
