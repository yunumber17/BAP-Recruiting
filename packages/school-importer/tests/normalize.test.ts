import { describe, it, expect } from 'vitest';
import {
  cleanText, parseCurrency, parsePercent, parseIntSafe, normalizePhone, normalizeUrl,
} from '../src/schools/normalize.js';
import { normalizeDivision, normalizeState, regionForState } from '../src/config/reference.js';

describe('text + numeric normalization', () => {
  it('cleans whitespace and zero-width chars', () => {
    expect(cleanText('  Foo​   Bar  ')).toBe('Foo Bar');
  });
  it('parses currency', () => {
    expect(parseCurrency('$32,400')).toBe(32400);
    expect(parseCurrency('18000.00')).toBe(18000);
    expect(parseCurrency('')).toBeNull();
  });
  it('parses percentages to fractions', () => {
    expect(parsePercent('45%')).toBeCloseTo(0.45);
    expect(parsePercent('0.07')).toBeCloseTo(0.07);
    expect(parsePercent('200%')).toBeNull();
  });
  it('parses ints tolerant of commas', () => {
    expect(parseIntSafe('1,401')).toBe(1401);
    expect(parseIntSafe('x')).toBeNull();
  });
  it('normalizes phones to E.164-ish', () => {
    expect(normalizePhone('(415) 555-0172')).toBe('+14155550172');
    expect(normalizePhone('1-415-555-0172')).toBe('+14155550172');
  });
  it('normalizes urls and rejects invalid ones', () => {
    expect(normalizeUrl('ucla.edu')).toBe('https://ucla.edu/');
    expect(normalizeUrl('https://Tampa.EDU/x')).toBe('https://tampa.edu/x');
    expect(normalizeUrl('not a url with spaces')).toBeNull();
    expect(normalizeUrl('')).toBeNull();
  });
});

describe('reference normalization', () => {
  it('maps division aliases', () => {
    expect(normalizeDivision('NCAA D1')).toBe('D1');
    expect(normalizeDivision('JC')).toBe('JUCO');
    expect(normalizeDivision('NJCAA')).toBe('JUCO');
    expect(normalizeDivision('bogus')).toBeNull();
  });
  it('maps states + regions', () => {
    expect(normalizeState('California')).toBe('CA');
    expect(normalizeState('fl')).toBe('FL');
    expect(normalizeState('District Of Columbia')).toBe('DC');
    expect(regionForState('CA')).toBe('WEST');
    expect(regionForState('FL')).toBe('SOUTH');
  });
});
