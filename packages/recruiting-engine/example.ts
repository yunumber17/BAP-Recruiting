/**
 * Runnable example:  npx tsx example.ts
 */
import { RecruitingScoreEngine, type Player, type School } from './src/index.js';

const player: Player = {
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
  location: { state: 'CA', lat: 34.05, lng: -118.24 },
  preferredRegions: ['West', 'South'],
};

const schools: School[] = [
  {
    name: 'State Flagship', division: 'D1', conference: 'SEC',
    academicRequirements: { minGpa: 2.3 }, academicProfile: { avgGpa: 3.6, avgSat: 1250 },
    recruitingNeeds: ['SS', 'OF'], coachPreferences: { positions: ['SS'], minExitVelocity: 92 },
    location: { state: 'GA', region: 'South' }, scholarshipAvailable: true, incomingClassSize: 12,
  },
  {
    name: 'Sunshine JUCO', division: 'JUCO', conference: 'FCSAA',
    recruitingNeeds: ['SS', 'P'], location: { state: 'FL', region: 'South' }, scholarshipAvailable: true,
  },
  {
    name: 'NESCAC Liberal Arts', division: 'D3', conference: 'NESCAC',
    academicRequirements: { minGpa: 3.3 }, academicProfile: { avgGpa: 3.9, avgSat: 1450 },
    recruitingNeeds: ['SS'], location: { state: 'ME', region: 'Northeast' }, scholarshipAvailable: false,
  },
];

const engine = new RecruitingScoreEngine();

for (const { school, result } of engine.rank(player, schools)) {
  console.log(
    `${school.name!.padEnd(22)} ${String(result.overall).padStart(5)}  ${result.grade.padEnd(2)}  ` +
    `${result.classification.padEnd(6)}  conf=${result.confidence}`,
  );
  console.log('   ' + result.summary.join('  |  '));
}
