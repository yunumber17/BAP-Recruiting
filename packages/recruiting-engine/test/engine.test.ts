import { describe, it, expect } from 'vitest';
import { RecruitingScoreEngine, scoreRecruit } from '../src/engine.js';
import type { ComponentKey } from '../src/types.js';
import {
  elitePlayer, midPlayer, lhpPlayer, sparsePlayer,
  d1Power, d1Academic, d3Academic, jucoSchool,
} from './fixtures.js';

const engine = new RecruitingScoreEngine();
const ALL_KEYS: ComponentKey[] = [
  'academicFit', 'athleticFit', 'rosterOpportunity', 'scholarshipPotential',
  'geographicFit', 'coachMatch', 'developmentPotential',
];

describe('RecruitingScoreEngine.score — shape & bounds', () => {
  const r = engine.score(elitePlayer, d1Power);

  it('produces a bounded overall score', () => {
    expect(r.overall).toBeGreaterThanOrEqual(0);
    expect(r.overall).toBeLessThanOrEqual(100);
  });

  it('returns every component in the breakdown', () => {
    for (const k of ALL_KEYS) {
      expect(r.breakdown[k]).toBeDefined();
      expect(r.breakdown[k].score).toBeGreaterThanOrEqual(0);
      expect(r.breakdown[k].score).toBeLessThanOrEqual(100);
      expect(r.breakdown[k].confidence).toBeGreaterThanOrEqual(0);
      expect(r.breakdown[k].confidence).toBeLessThanOrEqual(100);
    }
  });

  it('assigns a letter grade and classification', () => {
    expect(r.grade).toMatch(/^[ABCDF][+-]?$/);
    expect(['Reach', 'Target', 'Safety']).toContain(r.classification);
    expect(r.summary.length).toBeGreaterThan(0);
  });
});

describe('is deterministic', () => {
  it('returns identical results for identical inputs', () => {
    const a = JSON.stringify(engine.score(elitePlayer, d1Power));
    const b = JSON.stringify(engine.score(elitePlayer, d1Power));
    expect(a).toBe(b);
  });
});

describe('relative ranking makes sense', () => {
  it('elite SS scores higher at D1 than the mid OF does', () => {
    const elite = engine.score(elitePlayer, d1Power).overall;
    const mid = engine.score(midPlayer, d1Power).overall;
    expect(elite).toBeGreaterThan(mid);
  });

  it('the same player is a better fit at an easier level', () => {
    const atD1 = engine.score(midPlayer, d1Power).overall;
    const easier = engine.score(midPlayer, { ...d1Power, division: 'D3' }).overall;
    expect(easier).toBeGreaterThan(atD1);
  });

  it('classifies the mid player as a Reach at elite academic D1', () => {
    const res = engine.score(midPlayer, d1Academic);
    expect(res.classification).toBe('Reach');
  });

  it('classifies the elite player at/above Target at a power D1', () => {
    const res = engine.score(elitePlayer, d1Power);
    expect(['Target', 'Safety']).toContain(res.classification);
  });
});

describe('division-aware academic weighting', () => {
  it('weights academics more heavily at D3 than at D1', () => {
    const d1 = engine.score(elitePlayer, { ...d1Power, division: 'D1' });
    const d3 = engine.score(elitePlayer, { ...d3Academic, division: 'D3', recruitingNeeds: ['SS'] });
    expect(d3.breakdown.academicFit.weight).toBeGreaterThan(d1.breakdown.academicFit.weight);
    expect(d3.breakdown.athleticFit.weight).toBeLessThan(d1.breakdown.athleticFit.weight);
  });
});

describe('scholarship gating', () => {
  it('caps scholarship potential low for D3 (no athletic aid)', () => {
    const res = engine.score(elitePlayer, d3Academic);
    expect(res.breakdown.scholarshipPotential.score).toBeLessThanOrEqual(55);
  });

  it('rewards an elite player with strong scholarship potential at aid divisions', () => {
    const res = engine.score(elitePlayer, d1Power);
    expect(res.breakdown.scholarshipPotential.score).toBeGreaterThan(60);
  });
});

describe('confidence reflects data completeness', () => {
  it('a sparse profile yields lower confidence than a complete one', () => {
    const full = engine.score(elitePlayer, d1Power).confidence;
    const sparse = engine.score(sparsePlayer, d1Power).confidence;
    expect(sparse).toBeLessThan(full);
  });

  it('adds a low-confidence note when data is thin', () => {
    const res = engine.score(sparsePlayer, jucoSchool);
    const hasWarning = res.summary.some((s) => s.includes('データが不足'));
    expect(res.confidence).toBeLessThan(70);
    expect(hasWarning).toBe(true);
  });
});

describe('coach match — handedness demand', () => {
  it('rewards a lefty pitcher when the coach wants a lefty', () => {
    const res = engine.score(lhpPlayer, jucoSchool);
    expect(res.breakdown.coachMatch.score).toBeGreaterThan(70);
  });
});

describe('config override', () => {
  it('honors custom classification thresholds', () => {
    const strict = new RecruitingScoreEngine({ classification: { safety: 99, target: 98 } });
    expect(strict.score(elitePlayer, d1Power).classification).toBe('Reach');
  });

  it('scoreRecruit convenience matches engine output', () => {
    const a = scoreRecruit(elitePlayer, d1Power);
    const b = new RecruitingScoreEngine().score(elitePlayer, d1Power);
    expect(a.overall).toBe(b.overall);
  });
});

describe('rank()', () => {
  it('sorts schools best-fit first', () => {
    const ranked = engine.rank(elitePlayer, [d1Academic, d1Power, d3Academic, jucoSchool]);
    const scores = ranked.map((r) => r.result.overall);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });
});
