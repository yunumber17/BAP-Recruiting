import { describe, it, expect } from "vitest";
import type { SchoolRecord } from "../src/integrity/canonical.js";
import { makeExtId, toRecord } from "../src/integrity/canonical.js";
import { InMemorySchoolRepository } from "../src/integrity/repository.js";
import { runImport, verifyImport } from "../src/integrity/import.js";
import { checksum } from "../src/integrity/checksum.js";
import { validate } from "../src/validators/index.js";

function rec(over: Partial<SchoolRecord> = {}): SchoolRecord {
  return {
    extId: makeExtId(over.name ?? "Test University", over.state ?? "Texas"),
    name: "Test University", city: "Austin", state: "Texas", control: "PUBLIC",
    division: "D1", conference: "Big 12", campusSetting: "City",
    enrollment: 40000, acceptanceRate: 30, retentionRate: 90, graduationRate: 80,
    medianEarnings6yr: 50000, medianEarnings10yr: 70000, tuitionInState: 11000,
    tuitionOutState: 40000, roomAndBoard: 12000, netCost: 20000, applicationFee: 75,
    totalRevenue: 1000000, operatingExpenses: 900000, headCoach: "Coach A",
    assistantCoaches: ["B", "C"], recruitingCoordinator: null, rosterSize: 40,
    campLink: null, athleticWebsite: "https://x.com", schoolWebsite: "https://y.edu",
    address: "1 St", phone: "512-555-1212", email: null, sourceUrl: "https://s.com/1",
    coachNote: null, ...over,
  };
}

describe("import + verification", () => {
  it("imports all rows and verifies fidelity + checksum", async () => {
    const records = [rec({ name: "Alpha", state: "Texas" }), rec({ name: "Beta", state: "Ohio" })];
    const withIds = records.map((r) => ({ ...r, extId: makeExtId(r.name, r.state) }));
    const repo = new InMemorySchoolRepository();
    const imp = await runImport(withIds, repo);
    expect(imp.inserted).toBe(2);
    expect(imp.failed).toBe(0);
    const v = await verifyImport(withIds, repo, 2);
    expect(v.rowCountMatch).toBe(true);
    expect(v.checksumMatch).toBe(true);
    expect(v.fieldMismatches.length).toBe(0);
    expect(v.ok).toBe(true);
  });

  it("checksum is order-independent", () => {
    const a = rec({ name: "Alpha", state: "Texas" });
    const b = rec({ name: "Beta", state: "Ohio" });
    expect(checksum([a, b])).toBe(checksum([b, a]));
  });

  it("checksum changes when a field changes", () => {
    const a = rec({ name: "Alpha", state: "Texas" });
    const a2 = { ...a, rosterSize: 99 };
    expect(checksum([a])).not.toBe(checksum([a2]));
  });

  it("detects duplicate extIds during verification", async () => {
    const dup = rec({ name: "Same", state: "Texas" });
    const list = [dup, { ...dup }];
    const repo = new InMemorySchoolRepository();
    await runImport(list, repo);
    const v = await verifyImport(list, repo, 2);
    expect(v.duplicateExtIds.length).toBe(1);
    expect(v.ok).toBe(false);
  });

  it("makeExtId is deterministic and state-scoped", () => {
    expect(makeExtId("St. John's University", "New York")).toBe(makeExtId("St. John's University", "New York"));
    expect(makeExtId("Concordia University", "Oregon")).not.toBe(makeExtId("Concordia University", "Texas"));
  });
});

describe("validators", () => {
  it("flags duplicate name+state as error", () => {
    const raw = [{ "School Name": "X", State: "TX", City: "A", Division: "Division I (D1)", "Public/Private": "Public", Conference: "C" },
                 { "School Name": "X", State: "TX", City: "A", Division: "Division I (D1)", "Public/Private": "Public", Conference: "C" }];
    const recs = raw.map(toRecord);
    const v = validate(recs, raw);
    expect(v.issues.some((i) => i.code === "DUP_NAME_STATE")).toBe(true);
    expect(v.ok).toBe(false);
  });

  it("flags unrecognized division", () => {
    const raw = [{ "School Name": "Y", State: "TX", City: "A", Division: "Division IV", "Public/Private": "Public", Conference: "C" }];
    const v = validate(raw.map(toRecord), raw);
    expect(v.issues.some((i) => i.code === "DIVISION_ENUM")).toBe(true);
  });

  it("flags out-of-range roster size but does not correct it", () => {
    const raw = [{ "School Name": "Z", State: "TX", City: "A", Division: "JUCO", "Public/Private": "Public", Conference: "C", "Roster Size": "221" }];
    const recs = raw.map(toRecord);
    const v = validate(recs, raw);
    expect(recs[0]!.rosterSize).toBe(221); // untouched
    expect(v.issues.some((i) => i.code === "ROSTER_RANGE")).toBe(true);
  });

  it("accepts a clean row with zero errors", () => {
    const raw = [{ "School Name": "Clean U", State: "Ohio", City: "Columbus", Division: "Division II (D2)", "Public/Private": "Private", Conference: "GLVC", "Roster Size": "38", "Acceptance Rate": "55%", Phone: "614-555-1000", Email: "coach@clean.edu", "School Website": "https://clean.edu" }];
    const v = validate(raw.map(toRecord), raw);
    expect(v.errorCount).toBe(0);
  });
});
