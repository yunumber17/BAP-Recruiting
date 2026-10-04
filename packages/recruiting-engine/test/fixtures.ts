import type { Player, School } from '../src/types.js';

/** Elite D1-caliber shortstop with strong academics. */
export const elitePlayer: Player = {
  graduationYear: 2027,
  gpa: 3.8,
  sat: 1350,
  primaryPosition: 'SS',
  secondaryPosition: '2B',
  heightInches: 74,
  weightLbs: 190,
  throws: 'R',
  bats: 'R',
  exitVelocity: 97,
  sixtyYardDash: 6.5,
  infieldVelocity: 89,
  showcases: ['PG National', 'Area Code Games'],
  awards: ['All-State', 'Team MVP'],
  location: { state: 'CA', lat: 34.05, lng: -118.24 },
  preferredRegions: ['West'],
  maxTuition: 60000,
};

/** Solid D2/D3-caliber outfielder, average student, thin measurables. */
export const midPlayer: Player = {
  graduationYear: 2026,
  gpa: 3.1,
  primaryPosition: 'CF',
  heightInches: 70,
  weightLbs: 165,
  throws: 'R',
  bats: 'L',
  exitVelocity: 85,
  sixtyYardDash: 7.1,
  outfieldVelocity: 82,
  location: { state: 'TX' },
  preferredRegions: ['South'],
};

/** Left-handed pitcher, mid-velocity, strong academics. */
export const lhpPlayer: Player = {
  graduationYear: 2028,
  gpa: 3.9,
  act: 30,
  primaryPosition: 'P',
  heightInches: 75,
  weightLbs: 180,
  throws: 'L',
  bats: 'L',
  pitchingVelocity: 88,
  location: { state: 'NY' },
};

/** Sparse profile — only the required fields. */
export const sparsePlayer: Player = {
  graduationYear: 2027,
  gpa: 3.4,
  primaryPosition: '3B',
  heightInches: 72,
  weightLbs: 185,
  throws: 'R',
  bats: 'R',
};

export const d1Power: School = {
  name: 'State Flagship',
  division: 'D1',
  conference: 'SEC',
  acceptanceRate: 0.55,
  rosterSize: 40,
  incomingClassSize: 12,
  academicProfile: { avgGpa: 3.6, avgSat: 1250 },
  academicRequirements: { minGpa: 2.3 },
  recruitingNeeds: ['SS', 'OF', 'P'],
  coachPreferences: { positions: ['SS'], minExitVelocity: 92, preferredThrows: 'R' },
  location: { state: 'GA', region: 'South', lat: 33.95, lng: -83.37 },
  scholarshipAvailable: true,
};

export const d1Academic: School = {
  name: 'Ivy-style',
  division: 'D1',
  conference: 'Ivy League',
  acceptanceRate: 0.07,
  academicProfile: { avgGpa: 3.95, avgSat: 1500 },
  academicRequirements: { minGpa: 3.5, minSat: 1400 },
  recruitingNeeds: ['SS'],
  coachPreferences: { prioritizeAcademics: true, positions: ['SS'] },
  location: { state: 'MA', region: 'Northeast' },
  scholarshipAvailable: false,
};

export const d3Academic: School = {
  name: 'Liberal Arts',
  division: 'D3',
  conference: 'NESCAC',
  acceptanceRate: 0.15,
  academicProfile: { avgGpa: 3.9, avgSat: 1450 },
  academicRequirements: { minGpa: 3.3 },
  recruitingNeeds: ['OF'],
  location: { state: 'ME', region: 'Northeast' },
  scholarshipAvailable: false,
};

export const jucoSchool: School = {
  name: 'CC Powerhouse',
  division: 'JUCO',
  conference: 'FCSAA',
  recruitingNeeds: ['P', 'C'],
  coachPreferences: { minPitchingVelocity: 85, preferredThrows: 'L' },
  location: { state: 'FL', region: 'South' },
  scholarshipAvailable: true,
};
