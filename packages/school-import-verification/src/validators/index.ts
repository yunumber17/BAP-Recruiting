import type { SchoolRecord } from "../integrity/canonical.js";
import { normalizeDivision } from "../integrity/canonical.js";

export type Severity = "error" | "warning" | "info";

export interface Issue {
  readonly code: string;
  readonly severity: Severity;
  readonly field: string;
  readonly row: number;      // 1-based data row index (excludes header)
  readonly extId: string;
  readonly message: string;
  readonly value: string | number | null;
}

export interface ValidationResult {
  readonly issues: readonly Issue[];
  readonly errorCount: number;
  readonly warningCount: number;
  readonly infoCount: number;
  readonly ok: boolean;      // true when there are zero error-severity issues
}

const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Ranges below are SUSPICION bounds. Values outside are reported, never changed.
const RANGE = {
  enrollment: { lo: 50, hi: 120000 },
  acceptanceRate: { lo: 1, hi: 100 },
  retentionRate: { lo: 0, hi: 100 },
  graduationRate: { lo: 0, hi: 100 },
  rosterSize: { lo: 15, hi: 60 },
  tuition: { lo: 0, hi: 90000 },
} as const;

export function validate(
  records: readonly SchoolRecord[],
  rawRows: readonly Record<string, string>[],
): ValidationResult {
  const issues: Issue[] = [];
  const add = (i: Issue): void => { issues.push(i); };

  const seenExtId = new Map<string, number>();
  const seenNameState = new Map<string, number>();

  records.forEach((rec, idx) => {
    const row = idx + 1;
    const raw = rawRows[idx] ?? {};

    // Required identity fields
    if (!rec.name) add({ code: "REQUIRED_NAME", severity: "error", field: "School Name", row, extId: rec.extId, message: "Missing school name", value: null });
    if (!rec.state) add({ code: "REQUIRED_STATE", severity: "error", field: "State", row, extId: rec.extId, message: "Missing state", value: null });
    if (!rec.city) add({ code: "REQUIRED_CITY", severity: "warning", field: "City", row, extId: rec.extId, message: "Missing city", value: null });

    // Division enum integrity
    if (normalizeDivision(raw["Division"] ?? "") === null) {
      add({ code: "DIVISION_ENUM", severity: "error", field: "Division", row, extId: rec.extId, message: `Unrecognized division "${raw["Division"] ?? ""}"`, value: raw["Division"] ?? null });
    }

    // Duplicate keys
    const prevExt = seenExtId.get(rec.extId);
    if (prevExt != null) add({ code: "DUP_EXTID", severity: "error", field: "extId", row, extId: rec.extId, message: `Duplicate extId (first seen row ${prevExt})`, value: rec.extId });
    else seenExtId.set(rec.extId, row);

    const nsKey = `${rec.name.toLowerCase()}|${rec.state.toLowerCase()}`;
    const prevNs = seenNameState.get(nsKey);
    if (prevNs != null) add({ code: "DUP_NAME_STATE", severity: "error", field: "School Name+State", row, extId: rec.extId, message: `Duplicate name within same state (first seen row ${prevNs})`, value: rec.name });
    else seenNameState.set(nsKey, row);

    // URL validity (only when present)
    for (const [field, val] of [["Athletic Website", rec.athleticWebsite], ["School Website", rec.schoolWebsite], ["Source URL", rec.sourceUrl]] as const) {
      if (val && !URL_RE.test(val)) add({ code: "BAD_URL", severity: "warning", field, row, extId: rec.extId, message: `Malformed URL`, value: val });
    }

    // Email validity (only when present)
    if (rec.email && !EMAIL_RE.test(rec.email)) add({ code: "BAD_EMAIL", severity: "warning", field: "Email", row, extId: rec.extId, message: "Malformed email", value: rec.email });

    // Phone validity (only when present): expect 10 or 11 digits
    if (rec.phone) {
      const digits = rec.phone.replace(/\D/g, "");
      if (digits.length !== 10 && digits.length !== 11) add({ code: "BAD_PHONE", severity: "warning", field: "Phone", row, extId: rec.extId, message: `Phone has ${digits.length} digits (expected 10-11)`, value: rec.phone });
    }

    // Range / suspicious value checks (reported, not corrected)
    range(add, "ENROLLMENT_RANGE", "Enrollment", row, rec.extId, rec.enrollment, RANGE.enrollment);
    range(add, "ACCEPTANCE_RANGE", "Acceptance Rate", row, rec.extId, rec.acceptanceRate, RANGE.acceptanceRate);
    range(add, "RETENTION_RANGE", "Retention Rate", row, rec.extId, rec.retentionRate, RANGE.retentionRate);
    range(add, "GRADUATION_RANGE", "Graduation Rate", row, rec.extId, rec.graduationRate, RANGE.graduationRate);
    range(add, "ROSTER_RANGE", "Roster Size", row, rec.extId, rec.rosterSize, RANGE.rosterSize);
    range(add, "TUITION_RANGE", "Tuition Out-of-State", row, rec.extId, rec.tuitionOutState, RANGE.tuition);

    // Zero-suspicion for rates that should almost never be exactly 0
    if (rec.acceptanceRate === 0) add({ code: "ACCEPTANCE_ZERO", severity: "warning", field: "Acceptance Rate", row, extId: rec.extId, message: "Acceptance rate is 0 (suspicious)", value: 0 });
    if (rec.graduationRate === 0) add({ code: "GRAD_ZERO", severity: "info", field: "Graduation Rate", row, extId: rec.extId, message: "Graduation rate is 0", value: 0 });
  });

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;
  return { issues, errorCount, warningCount, infoCount, ok: errorCount === 0 };
}

function range(
  add: (i: Issue) => void, code: string, field: string, row: number, extId: string,
  value: number | null, b: { lo: number; hi: number },
): void {
  if (value == null) return;
  if (value < b.lo || value > b.hi) {
    add({ code: `${code}`, severity: "warning", field, row, extId, message: `Value ${value} outside expected [${b.lo}, ${b.hi}]`, value });
  }
}
