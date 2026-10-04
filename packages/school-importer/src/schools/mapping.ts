import type { ColumnMapping, RawRecord } from '../etl/types.js';

/**
 * Default column mapping: canonical field → candidate source headers (first
 * match wins). Never positional. Override via a JSON file passed to the CLI.
 */
export const DEFAULT_SCHOOL_MAPPING: ColumnMapping = {
  extId: ['extId', 'ext_id', 'id', 'ID'],
  name: ['name', 'School', 'school', 'SCHOOL'],
  city: ['city', 'City'],
  state: ['state', 'State'],
  region: ['region', 'Region'],
  division: ['division', 'div', 'Division', 'DIVISION'],
  conference: ['conference', 'conf', 'Conference', 'CONFERENCE'],
  type: ['type', 'Type', 'TYPE'],
  enrollment: ['enrollment', 'size', 'SIZE', 'Size'],
  tuition: ['tuition', 'Tuition'],
  acceptanceRate: ['acceptanceRate', 'acceptance_rate', 'AcceptanceRate'],
  rosterSize: ['rosterSize', 'roster', 'Roster'],
  scholarshipAvailable: ['scholarshipAvailable', 'scholarship', 'Scholarship'],
  website: ['website', 'url', 'URL', 'Website'],
  email: ['email', 'Email'],
  phone: ['phone', 'Phone'],
  graduationRate: ['graduationRate', 'graduation_rate', 'GraduationRate'],
};

/** Resolve a canonical field from a raw row using the mapping. */
export function pick(raw: RawRecord, headers: string | string[]): unknown {
  const list = Array.isArray(headers) ? headers : [headers];
  for (const h of list) {
    if (h in raw && raw[h] !== undefined && raw[h] !== '') return raw[h];
  }
  return undefined;
}
