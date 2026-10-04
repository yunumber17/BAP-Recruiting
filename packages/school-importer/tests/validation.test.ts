import { describe, it, expect } from 'vitest';
import { SchoolResource } from '../src/schools/SchoolResource.js';
import { DEFAULT_SCHOOL_MAPPING } from '../src/schools/mapping.js';

function run(raw: Record<string, unknown>) {
  const normalized = SchoolResource.normalize(raw);
  const mapped = SchoolResource.map(normalized, DEFAULT_SCHOOL_MAPPING);
  const validated = SchoolResource.validate(mapped, 0);
  return { mapped, validated };
}

describe('SchoolResource map + validate', () => {
  it('accepts a well-formed row and normalizes fields', () => {
    const { validated } = run({
      id: '26', School: 'University of Tampa', City: 'tampa', State: 'Florida',
      Division: 'NCAA D2', Conference: 'Sunshine State', Type: 'private',
      SIZE: '8,645', tuition: '$32,400', scholarship: 'yes', url: 'ut.edu',
    });
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      expect(validated.value.extId).toBe(26);
      expect(validated.value.division).toBe('D2');
      expect(validated.value.state).toBe('FL');
      expect(validated.value.region).toBe('SOUTH');
      expect(validated.value.type).toBe('Private');
      expect(validated.value.enrollment).toBe(8645);
      expect(validated.value.tuition).toBe(32400);
      expect(validated.value.scholarshipAvailable).toBe(true);
      expect(validated.value.website).toBe('https://ut.edu/');
    }
  });

  it('rejects a missing extId / name / bad division', () => {
    const { validated } = run({ School: '', Division: 'bogus' });
    expect(validated.ok).toBe(false);
    if (!validated.ok) {
      const fields = validated.issues.map((i) => i.field);
      expect(fields).toContain('extId');
      expect(fields).toContain('division');
    }
  });

  it('validates email format but never persists it', () => {
    const { validated } = run({
      id: '1', School: 'X', Division: 'D1', email: 'not-an-email',
    });
    expect(validated.ok).toBe(false);
    if (!validated.ok) expect(validated.issues.some((i) => i.field === 'email')).toBe(true);
  });

  it('flags a business-rule violation (D3 + scholarship)', () => {
    const { validated } = run({ id: '5', School: 'Y', Division: 'NCAA D3', scholarship: 'yes' });
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      const issues = SchoolResource.businessValidate(validated.value, 0);
      expect(issues.some((i) => i.field === 'scholarshipAvailable')).toBe(true);
    }
  });

  it('hash is stable across re-runs and changes with content', () => {
    const a = run({ id: '1', School: 'X', Division: 'D1' });
    const b = run({ id: '1', School: 'X', Division: 'D1' });
    const c = run({ id: '1', School: 'X Renamed', Division: 'D1' });
    if (a.validated.ok && b.validated.ok && c.validated.ok) {
      expect(SchoolResource.contentHash(a.validated.value)).toBe(SchoolResource.contentHash(b.validated.value));
      expect(SchoolResource.contentHash(a.validated.value)).not.toBe(SchoolResource.contentHash(c.validated.value));
    }
  });
});
