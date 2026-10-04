import type { RawRecord } from '../etl/types.js';

/** Collapse whitespace, strip zero-width chars, normalize unicode (NFC). */
export function cleanText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFC')
    .replace(/[​-‍﻿]/g, '') // zero-width
    .replace(/\s+/g, ' ')
    .trim();
}

/** Title-case a name while preserving common acronyms and small words. */
export function titleCase(value: string): string {
  const small = new Set(['of', 'the', 'and', 'at', 'in', 'a']);
  return value
    .toLowerCase()
    .split(' ')
    .map((w, i) => {
      if (/^[a-z]{1,4}$/.test(w) && w.toUpperCase() === w) return w; // leave acronyms handled elsewhere
      if (i > 0 && small.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/** "$32,400" | "32400.00" → 32400 (integer USD). null on empty/invalid. */
export function parseCurrency(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** "45%" | "0.45" | "45" → 0.45 (fraction 0–1). null on invalid. */
export function parsePercent(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const raw = String(value).replace(/[%\s]/g, '');
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const frac = n > 1 ? n / 100 : n;
  return frac >= 0 && frac <= 1 ? frac : null;
}

/** Parse an integer, tolerant of commas. null on empty/invalid. */
export function parseIntSafe(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[,\s]/g, ''));
  return Number.isInteger(n) ? n : Number.isFinite(n) ? Math.round(n) : null;
}

/** Normalize a US phone to E.164-ish "+1XXXXXXXXXX" when possible, else clean. */
export function normalizePhone(value: unknown): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return cleaned; // keep original if we can't confidently format
}

/** Ensure a URL has a scheme; lowercase host. null on empty. */
export function normalizeUrl(value: unknown): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  const withScheme = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  try {
    const u = new URL(withScheme);
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return null;
  }
}

/** Normalize known raw fields in a school row (idempotent). */
export function normalizeSchoolRow(raw: RawRecord): RawRecord {
  const out: RawRecord = {};
  for (const [k, v] of Object.entries(raw)) {
    out[cleanText(k)] = typeof v === 'string' ? cleanText(v) : v;
  }
  return out;
}
