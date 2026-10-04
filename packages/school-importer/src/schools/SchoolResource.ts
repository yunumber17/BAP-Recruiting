import type {
  ColumnMapping, RawRecord, ResourceDefinition, ValidationIssue, ValidationResult,
} from '../etl/types.js';
import {
  cleanText, parseCurrency, parsePercent, parseIntSafe, normalizePhone, normalizeUrl, titleCase,
} from './normalize.js';
import { normalizeDivision, normalizeState, regionForState } from '../config/reference.js';
import { DEFAULT_SCHOOL_MAPPING, pick } from './mapping.js';
import { SchoolInputSchema, toRecord, hashSchool, type SchoolRecord } from './schema.js';

function parseBool(v: unknown): boolean | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const s = String(v).trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 't'].includes(s)) return true;
  if (['false', 'no', 'n', '0', 'f'].includes(s)) return false;
  return undefined;
}

/** ResourceDefinition for Schools — the first implementation on the ETL framework. */
export const SchoolResource: ResourceDefinition<SchoolRecord, number> = {
  name: 'schools',
  defaultMapping: DEFAULT_SCHOOL_MAPPING,

  normalize(raw: RawRecord): RawRecord {
    // Keys + string values cleaned (whitespace/encoding); per-field parsing is in map().
    const out: RawRecord = {};
    for (const [k, v] of Object.entries(raw)) {
      out[cleanText(k)] = typeof v === 'string' ? cleanText(v) : v;
    }
    return out;
  },

  map(raw: RawRecord, mapping: ColumnMapping): RawRecord {
    const g = (field: string): unknown => pick(raw, mapping[field] ?? field);

    const rawDivision = g('division');
    const rawState = g('state');
    const state = rawState !== undefined ? normalizeState(String(rawState)) ?? String(rawState) : undefined;
    const division = rawDivision !== undefined ? normalizeDivision(String(rawDivision)) ?? String(rawDivision) : undefined;
    const regionExplicit = g('region');
    const region =
      regionExplicit !== undefined
        ? String(regionExplicit).toUpperCase()
        : state && typeof state === 'string'
          ? regionForState(state) ?? undefined
          : undefined;

    const nameRaw = g('name');
    const typeRaw = g('type');
    const candidate: RawRecord = {
      extId: parseIntSafe(g('extId')) ?? undefined,
      name: nameRaw !== undefined ? cleanText(nameRaw) : undefined,
      city: g('city') !== undefined ? titleCase(cleanText(g('city'))) : undefined,
      state,
      region,
      division,
      conference: g('conference') !== undefined ? cleanText(g('conference')) : undefined,
      type: typeRaw !== undefined ? normalizeType(String(typeRaw)) : undefined,
      enrollment: parseIntSafe(g('enrollment')) ?? undefined,
      tuition: parseCurrency(g('tuition')) ?? undefined,
      acceptanceRate: parsePercent(g('acceptanceRate')) ?? undefined,
      rosterSize: parseIntSafe(g('rosterSize')) ?? undefined,
      scholarshipAvailable: parseBool(g('scholarshipAvailable')),
      website: normalizeUrl(g('website')) ?? undefined,
      email: g('email') !== undefined ? cleanText(g('email')).toLowerCase() : undefined,
      phone: normalizePhone(g('phone')) ?? undefined,
      graduationRate: parsePercent(g('graduationRate')) ?? undefined,
    };
    // Drop undefined so zod .nullish() optionals behave as "absent".
    for (const k of Object.keys(candidate)) if (candidate[k] === undefined) delete candidate[k];
    return candidate;
  },

  validate(candidate: RawRecord, index: number): ValidationResult<SchoolRecord> {
    const parsed = SchoolInputSchema.safeParse(candidate);
    if (!parsed.success) {
      const issues: ValidationIssue[] = parsed.error.issues.map((i) => ({
        index,
        field: i.path.join('.') || '(root)',
        message: i.message,
        value: pathValue(candidate, i.path),
      }));
      return { ok: false, issues };
    }
    return { ok: true, value: toRecord(parsed.data) };
  },

  businessValidate(record: SchoolRecord, index: number): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    // D3 offers no athletic scholarships — flag contradictory source data.
    if (record.division === 'D3' && record.scholarshipAvailable === true) {
      issues.push({ index, field: 'scholarshipAvailable', message: 'D3 cannot offer athletic scholarships', value: true });
    }
    if (record.rosterSize !== null && record.rosterSize > 60) {
      issues.push({ index, field: 'rosterSize', message: 'roster size unrealistically large', value: record.rosterSize });
    }
    return issues;
  },

  naturalKey: (record) => record.extId,
  contentHash: (record) => hashSchool(record),
};

function normalizeType(v: string): string | undefined {
  const s = v.trim().toLowerCase();
  if (s.startsWith('pub')) return 'Public';
  if (s.startsWith('priv')) return 'Private';
  return undefined;
}

function pathValue(obj: RawRecord, path: (string | number)[]): unknown {
  return typeof path[0] === 'string' ? obj[path[0]] : undefined;
}

// Re-export for the CLI/tests.
export const SchoolValidationSchema = SchoolInputSchema;
