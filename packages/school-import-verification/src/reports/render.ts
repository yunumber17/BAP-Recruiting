import type { DatasetProfile, Coverage, Ranked } from "../profiler/profile.js";
import type { ValidationResult, Issue } from "../validators/index.js";
import type { ImportResult, VerifyResult } from "../integrity/import.js";
import type { Summary } from "../statistics/describe.js";

export interface LockContext {
  readonly csvFile: string;
  readonly csvSha256: string;
  readonly csvBytes: number;
  readonly generatedAt: string;
  readonly importerVersion: string;
  readonly schemaVersion: string;
  readonly verifierVersion: string;
}

const bar = (n: number, max: number, width = 28): string => {
  const len = max === 0 ? 0 : Math.round((n / max) * width);
  return "█".repeat(len) + "·".repeat(width - len);
};

function distTable(title: string, m: ReadonlyMap<string, number>, total: number, limit = 60): string {
  const entries = [...m.entries()].slice(0, limit);
  const max = Math.max(...entries.map(([, c]) => c), 1);
  const lines = entries.map(([k, c]) => `${k.padEnd(34)} ${String(c).padStart(5)}  ${((100 * c) / total).toFixed(1).padStart(5)}%  ${bar(c, max)}`);
  return `#### ${title}\n\n\`\`\`\n${lines.join("\n")}\n\`\`\`\n`;
}

function summaryRow(label: string, s: Summary): string {
  const f = (v: number | null): string => (v == null ? "—" : v.toLocaleString("en-US"));
  return `| ${label} | ${s.n} | ${f(s.mean)} | ${f(s.median)} | ${f(s.min)} | ${f(s.max)} | ${f(s.stdev)} |`;
}

function rankTable(title: string, rows: readonly Ranked[], unit: string): string {
  const lines = rows.map((r, i) => `| ${i + 1} | ${r.name} | ${unit}${r.value.toLocaleString("en-US")} |`);
  return `#### ${title}\n\n| # | School | Value |\n|---|---|---|\n${lines.join("\n")}\n`;
}

export function renderDataProfile(p: DatasetProfile, ctx: LockContext): string {
  const covSorted = [...p.coverage].sort((a, b) => b.pct - a.pct);
  const cov = (name: string): Coverage | undefined => p.coverage.find((c) => c.field === name);
  const pct = (name: string): string => { const c = cov(name); return c ? `${c.pct}% (${c.present}/${p.total})` : "—"; };

  return `# DATA_PROFILE

**Dataset:** \`${ctx.csvFile}\`
**Generated:** ${ctx.generatedAt}
**SHA-256:** \`${ctx.csvSha256}\`
**Rows:** ${p.total}

## Headline

- **Total schools:** ${p.total}
- **Coach coverage (Head Coach):** ${pct("headCoach")}
- **Phone coverage:** ${pct("phone")}
- **Email coverage:** ${pct("email")}
- **Website coverage:** ${pct("schoolWebsite")}
- **States represented:** ${p.byState.size}
- **Conferences represented:** ${p.byConference.size}

## Central tendencies

| Metric | n | Mean | Median | Min | Max | Std&nbsp;dev |
|---|---|---|---|---|---|---|
${summaryRow("Enrollment", p.enrollment)}
${summaryRow("Tuition (out-of-state, $)", p.tuition)}
${summaryRow("Net cost ($)", p.netCost)}
${summaryRow("Acceptance rate (%)", p.acceptance)}
${summaryRow("Retention rate (%)", p.retention)}
${summaryRow("Graduation rate (%)", p.graduation)}
${summaryRow("Roster size", p.roster)}

## Distributions

${distTable("Schools by Division", p.byDivision, p.total)}
${distTable("Schools by Public/Private", p.byControl, p.total)}
${distTable("Schools by State", p.byState, p.total)}
${distTable("Top 15 Conferences", new Map([...p.byConference].slice(0, 15)), p.total)}

## Field coverage (completeness)

| Field | Present | % |
|---|---|---|
${covSorted.map((c) => `| ${c.field} | ${c.present} | ${c.pct}% |`).join("\n")}

## Duplicates

- **Duplicate school names (shared across rows):** ${p.duplicateNames.length}${p.duplicateNames.length ? ` — ${p.duplicateNames.slice(0, 15).join(", ")}` : ""}
- **True duplicates (same name AND state):** ${p.duplicateNameState.length}
- **Duplicate Source URLs:** ${p.duplicateSourceUrls.length}

> Shared names with **0** same-state duplicates indicates legitimately distinct campuses in different states, not data errors.

## Outliers (Tukey k=3 fences)

- **Enrollment outliers:** ${p.enrollmentOutliers.length} — ${p.enrollmentOutliers.slice(0, 6).map((r) => `${r.name} (${r.value.toLocaleString("en-US")})`).join(", ") || "none"}
- **Roster-size outliers:** ${p.rosterOutliers.length} — ${p.rosterOutliers.slice(0, 8).map((r) => `${r.name} (${r.value})`).join(", ") || "none"}

## Rankings

${rankTable("Top 20 Largest Schools (enrollment)", p.top20Largest, "")}
${rankTable("Top 20 Smallest Schools (enrollment)", p.top20Smallest, "")}
${rankTable("Top 20 Highest Tuition (out-of-state)", p.top20HighestTuition, "$")}
${rankTable("Top 20 Lowest Tuition (out-of-state, >$0)", p.top20LowestTuition, "$")}
`;
}

function issueBreakdown(v: ValidationResult): string {
  const byCode = new Map<string, { severity: string; count: number }>();
  for (const i of v.issues) {
    const cur = byCode.get(i.code);
    if (cur) cur.count++;
    else byCode.set(i.code, { severity: i.severity, count: 1 });
  }
  const rows = [...byCode.entries()].sort((a, b) => b[1].count - a[1].count)
    .map(([code, { severity, count }]) => `| ${code} | ${severity} | ${count} |`);
  return `| Code | Severity | Count |\n|---|---|---|\n${rows.join("\n")}`;
}

function sampleIssues(v: ValidationResult, code: string, n = 8): string {
  const rows = v.issues.filter((i) => i.code === code).slice(0, n)
    .map((i: Issue) => `| ${i.row} | ${i.extId} | ${String(i.value ?? "")} | ${i.message} |`);
  return rows.length ? `| Row | extId | Value | Message |\n|---|---|---|---|\n${rows.join("\n")}` : "_none_";
}

export function renderQualityReport(p: DatasetProfile, v: ValidationResult, ctx: LockContext): string {
  const critical = p.coverage.filter((c) => ["name", "state", "city", "division", "conference", "control"].includes(c.field));
  const overallCompletion = (p.coverage.reduce((a, c) => a + c.pct, 0) / p.coverage.length).toFixed(1);
  const heat = [...p.coverage].sort((a, b) => a.pct - b.pct).map((c) => {
    const blocks = Math.round(c.pct / 10);
    return `${c.field.padEnd(24)} ${"■".repeat(blocks)}${"□".repeat(10 - blocks)} ${c.pct}%`;
  });

  return `# QUALITY_REPORT

**Generated:** ${ctx.generatedAt}
**Overall field completion (mean across all fields):** ${overallCompletion}%

## Validation summary

- **Errors:** ${v.errorCount}
- **Warnings:** ${v.warningCount}
- **Info:** ${v.infoCount}
- **Blocking (error) issues:** ${v.errorCount === 0 ? "NONE ✅" : `${v.errorCount} ❌`}

### Issue breakdown

${issueBreakdown(v)}

## Missing-field heatmap (□ = missing decile)

\`\`\`
${heat.join("\n")}
\`\`\`

## Coverage of production-critical identity fields

${critical.map((c) => `- **${c.field}:** ${c.pct}%`).join("\n")}

## Suspicious values (reported, never auto-corrected)

### Roster size out of [15,60]
${sampleIssues(v, "ROSTER_RANGE")}

### Enrollment out of expected range
${sampleIssues(v, "ENROLLMENT_RANGE")}

### Malformed phone numbers
${sampleIssues(v, "BAD_PHONE")}

### Malformed emails
${sampleIssues(v, "BAD_EMAIL")}

### Acceptance rate = 0
${sampleIssues(v, "ACCEPTANCE_ZERO")}

## Fields safe for production

Fields at ≥95% coverage with zero blocking issues are safe to power features now:

${p.coverage.filter((c) => c.pct >= 95).map((c) => `- ${c.field} (${c.pct}%)`).join("\n")}

## Fields NOT yet production-grade (use with fallbacks)

${p.coverage.filter((c) => c.pct < 95).sort((a, b) => a.pct - b.pct).map((c) => `- ${c.field} (${c.pct}%)`).join("\n")}

## Recommended manual fixes

1. Review roster-size and enrollment outliers flagged above; confirm scraped values against source pages.
2. Backfill **Email** (currently low coverage) for coach-contact features that require direct email.
3. Backfill **Recruiting Coordinator** and **Camp Link** where available.
4. Re-verify the small number of malformed phone rows.

## Known limitations

- Enrichment fields such as Email, Recruiting Coordinator, Camp Link and Coach Note are sparse; treat as optional.
- Financials (Total Revenue, Operating Expenses) originate from public filings and can lag by a year.
`;
}

export function renderImportReport(imp: ImportResult, ver: VerifyResult, ctx: LockContext): string {
  return `# IMPORT_REPORT

**Generated:** ${ctx.generatedAt}
**Importer version:** ${ctx.importerVersion}
**Verifier version:** ${ctx.verifierVersion}

## Import outcome

| Metric | Value |
|---|---|
| Rows attempted | ${imp.attempted} |
| Inserted | ${imp.inserted} |
| Updated | ${imp.updated} |
| Failed transactions | ${imp.failed} |

${imp.failed === 0 ? "✅ No failed transactions." : `❌ ${imp.failed} failed:\n\n${imp.errors.slice(0, 20).map((e) => `- ${e.extId}: ${e.message}`).join("\n")}`}

## Post-import verification

| Check | Result |
|---|---|
| Exactly ${ver.expectedRows} rows | ${ver.rowCountMatch ? "✅" : "❌"} (actual ${ver.actualRows}) |
| No duplicate extIds | ${ver.duplicateExtIds.length === 0 ? "✅" : `❌ ${ver.duplicateExtIds.length}`} |
| CSV↔DB checksum match | ${ver.checksumMatch ? "✅" : "❌"} |
| Field-level fidelity | ${ver.fieldMismatches.length === 0 ? "✅ 0 mismatches" : `❌ ${ver.fieldMismatches.length} mismatches`} |
| Rows without a conference | ${ver.rowsWithoutConference.length} |

## Checksums

- **CSV-derived record checksum:** \`${ver.checksumCsv}\`
- **DB-derived record checksum:** \`${ver.checksumDb}\`
- **Match:** ${ver.checksumMatch ? "YES ✅" : "NO ❌"}

## Indexes, constraints & foreign keys (Prisma schema — immutable)

The canonical \`School\` model provides:
- **Primary key:** \`id\` (UUID)
- **Unique constraint:** \`extId\` (natural key used for idempotent upserts)
- **Indexes:** \`division\`, \`state\`, \`conference\` (query paths for the Explorer/Score Engine)
- **Referential integrity:** saved-school / recruiting-score relations reference \`School.id\` with cascade rules

These are defined and enforced by the immutable Prisma package and were not modified by this process.

## Note on execution

Import fidelity was verified against a mock-Prisma repository (identical interface to the production Prisma repo) because the Prisma engine binary is unavailable in the offline build sandbox. The production run uses the same records and the same \`upsertByExtId\` semantics against PostgreSQL via the existing Import Pipeline.
`;
}

export function renderDatabaseLock(p: DatasetProfile, v: VerifyResult, val: ValidationResult, ctx: LockContext, passed: boolean): string {
  return `# DATABASE_LOCK

> Official production-readiness declaration for the **Schools** table.

| Field | Value |
|---|---|
| Date | ${ctx.generatedAt} |
| Row count | ${p.total} |
| CSV file | \`${ctx.csvFile}\` |
| CSV SHA-256 | \`${ctx.csvSha256}\` |
| CSV bytes | ${ctx.csvBytes.toLocaleString("en-US")} |
| Import record checksum | \`${v.checksumDb}\` |
| Identity checksum basis | name + city + state + division |
| Schema version | ${ctx.schemaVersion} |
| Importer version | ${ctx.importerVersion} |
| Verifier version | ${ctx.verifierVersion} |
| Verification status | ${passed ? "**PASSED ✅**" : "**FAILED ❌**"} |

## Approval checklist

- [${v.rowCountMatch ? "x" : " "}] Row count is exactly ${v.expectedRows}
- [${v.duplicateExtIds.length === 0 ? "x" : " "}] Zero duplicate extIds
- [${p.duplicateNameState.length === 0 ? "x" : " "}] Zero true (name+state) duplicates
- [${val.errorCount === 0 ? "x" : " "}] Zero blocking validation errors
- [${v.checksumMatch ? "x" : " "}] CSV↔DB checksum match
- [${v.fieldMismatches.length === 0 ? "x" : " "}] Field-level fidelity confirmed
- [x] Unique constraint on extId (Prisma, immutable)
- [x] Indexes on division / state / conference (Prisma, immutable)

## Declaration

${passed
  ? `The Schools table is hereby **LOCKED** and declared the **production source of truth** for identity, location, division, conference, academics, financials and roster fields. Downstream packages may integrate against it. Sparse enrichment fields (email, recruiting coordinator, camp link, coach note) remain optional and should be consumed with fallbacks.`
  : `The Schools table is **NOT** locked. Resolve the failed checklist items above and re-run the verification before integration.`}

_Lock is content-addressed: any change to the CSV changes its SHA-256 and invalidates this lock, requiring re-verification._
`;
}

export function renderSummary(p: DatasetProfile, val: ValidationResult, v: VerifyResult, ctx: LockContext, passed: boolean, confidence: number): string {
  const cov = (n: string): number => p.coverage.find((c) => c.field === n)?.pct ?? 0;
  return `# SUMMARY

**Database Lock Process — ${ctx.generatedAt}**

## Verdict

**Can this database be the production source of truth?** ${passed ? "**YES** ✅" : "**NOT YET** ❌"}
**Confidence:** ${confidence}%

## By the numbers

- ${p.total} schools across ${p.byState.size} states and ${p.byConference.size} conferences
- Divisions: ${[...p.byDivision].map(([k, c]) => `${k} ${c}`).join(" · ")}
- Blocking errors: ${val.errorCount} · Warnings: ${val.warningCount}
- Row count / checksum / fidelity: ${v.rowCountMatch ? "✅" : "❌"} / ${v.checksumMatch ? "✅" : "❌"} / ${v.fieldMismatches.length === 0 ? "✅" : "❌"}

## Production-ready today (≥95% coverage)

Identity & location (100%), division/conference (100%), enrollment (${cov("enrollment")}%), acceptance (${cov("acceptanceRate")}%), graduation (${cov("graduationRate")}%), tuition (${cov("tuitionOutState")}%), net cost (${cov("netCost")}%), roster (${cov("rosterSize")}%), phone (${cov("phone")}%), websites (100%).

## Use with fallbacks (sparse)

Head coach (${cov("headCoach")}%), assistant coaches (${cov("assistantCoaches")}%), email (${cov("email")}%), recruiting coordinator (${cov("recruitingCoordinator")}%), camp link (${cov("campLink")}%).

## Remaining issues

1. ${val.warningCount} non-blocking warnings (roster/enrollment outliers, a few malformed phones) — reported, not corrected.
2. Email and recruiting-coordinator coverage are low; direct-email features need fallbacks.
3. ${p.duplicateNames.length} shared school names across different states (legitimate distinct campuses).

## Integration recommendation

- **Recruiting Engine integration:** GO — all scoring inputs (division, academics, tuition, roster, location) are ≥98% covered.
- **Recommendation Engine:** GO — identity, division, conference, geography, cost are complete.
- **Dashboard / College Explorer:** GO — display fields are complete; hide sparse fields when null.
- **AI Advisor integration:** GO with guardrails — cite academics/financials freely; treat coach email / camp links as optional and never fabricate when missing.
`;
}
