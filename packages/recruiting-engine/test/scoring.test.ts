import { describe, it, expect } from 'vitest';
import { scoreAthleticFit } from '../src/scoring/athleticFit.js';
import { scoreAcademicFit } from '../src/scoring/academicFit.js';
import { scoreGeographicFit } from '../src/scoring/geographicFit.js';
import { scoreDevelopmentPotential } from '../src/scoring/developmentPotential.js';
import { scaleMetric, letterGrade, clamp, regionForState } from '../src/util.js';
import { elitePlayer, midPlayer, d1Power, d3Academic } from './fixtures.js';

describe('util.scaleMetric', () => {
  it('maps floor→50 and good→90 for higher-is-better', () => {
    expect(scaleMetric(88, 88, 96)).toBe(50);
    expect(scaleMetric(96, 88, 96)).toBe(90);
  });
  it('handles lower-is-better (60-yard dash)', () => {
    expect(scaleMetric(7.1, 7.1, 6.6)).toBe(50);
    expect(scaleMetric(6.6, 7.1, 6.6)).toBe(90);
    expect(scaleMetric(6.4, 7.1, 6.6)).toBeGreaterThan(90);
  });
  it('clamps to 0–100', () => {
    expect(scaleMetric(200, 88, 96)).toBe(100);
    expect(scaleMetric(0, 88, 96)).toBe(0);
  });
});

describe('util.letterGrade', () => {
  it('grades boundaries correctly', () => {
    expect(letterGrade(98)).toBe('A+');
    expect(letterGrade(85)).toBe('B');
    expect(letterGrade(72)).toBe('C-');
    expect(letterGrade(40)).toBe('F');
  });
});

describe('util.regionForState', () => {
  it('derives regions', () => {
    expect(regionForState('CA')).toBe('West');
    expect(regionForState('fl')).toBe('South');
    expect(regionForState('XX')).toBeUndefined();
  });
});

describe('athleticFit', () => {
  it('scores the elite SS above the mid CF at the same division', () => {
    const elite = scoreAthleticFit(elitePlayer, d1Power).score;
    const mid = scoreAthleticFit(midPlayer, d1Power).score;
    expect(elite).toBeGreaterThan(mid);
    expect(elite).toBeGreaterThan(75);
  });
  it('same measurables grade higher against an easier division', () => {
    const d1 = scoreAthleticFit(midPlayer, d1Power).score;
    const d3 = scoreAthleticFit(midPlayer, { ...d1Power, division: 'D3' }).score;
    expect(d3).toBeGreaterThan(d1);
  });
});

describe('academicFit', () => {
  it('penalizes falling below a hard GPA requirement', () => {
    const below = scoreAcademicFit({ ...midPlayer, gpa: 2.0 }, { division: 'D3', academicRequirements: { minGpa: 3.3 } });
    const above = scoreAcademicFit({ ...midPlayer, gpa: 3.6 }, { division: 'D3', academicRequirements: { minGpa: 3.3 } });
    expect(below.score).toBeLessThan(above.score);
    expect(below.notes.join(' ')).toContain('最低基準');
  });
  it('rewards a strong student at an academic school', () => {
    const res = scoreAcademicFit(elitePlayer, d3Academic);
    expect(res.score).toBeGreaterThan(60);
  });
});

describe('geographicFit', () => {
  it('rewards a matching region preference', () => {
    const match = scoreGeographicFit(
      { ...midPlayer, preferredRegions: ['South'] },
      { division: 'D2', location: { state: 'TX' } },
    ).score;
    const miss = scoreGeographicFit(
      { ...midPlayer, preferredRegions: ['West'] },
      { division: 'D2', location: { state: 'TX' } },
    ).score;
    expect(match).toBeGreaterThan(miss);
  });
});

describe('developmentPotential', () => {
  it('gives younger players more upside', () => {
    const young = scoreDevelopmentPotential({ ...elitePlayer, graduationYear: 2029 }, d1Power, 2025).score;
    const old = scoreDevelopmentPotential({ ...elitePlayer, graduationYear: 2025 }, d1Power, 2025).score;
    expect(young).toBeGreaterThan(old);
  });
});

describe('util.clamp', () => {
  it('bounds values', () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(105)).toBe(100);
    expect(clamp(50)).toBe(50);
  });
});
