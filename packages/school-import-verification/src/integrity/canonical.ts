// Canonical School record — the shape the immutable Import Pipeline / Prisma
// School model consume. This package maps the scraper CSV onto it (adapter),
// but does NOT modify the importer or schema.

import { parseMoney, parsePercent, parseCount, cleanText } from "../statistics/parse.js";

export type Division = "D1" | "D2" | "D3" | "NAIA" | "JUCO";
export type Control = "PUBLIC" | "PRIVATE" | "UNKNOWN";

export interface SchoolRecord {
  readonly extId: string;
  readonly name: string;
  readonly city: string;
  readonly state: string;
  readonly control: Control;
  readonly division: Division;
  readonly conference: string | null;
  readonly campusSetting: string | null;
  readonly enrollment: number | null;
  readonly acceptanceRate: number | null;
  readonly retentionRate: number | null;
  readonly graduationRate: number | null;
  readonly medianEarnings6yr: number | null;
  readonly medianEarnings10yr: number | null;
  readonly tuitionInState: number | null;
  readonly tuitionOutState: number | null;
  readonly roomAndBoard: number | null;
  readonly netCost: number | null;
  readonly applicationFee: number | null;
  readonly totalRevenue: number | null;
  readonly operatingExpenses: number | null;
  readonly headCoach: string | null;
  readonly assistantCoaches: readonly string[];
  readonly recruitingCoordinator: string | null;
  readonly rosterSize: number | null;
  readonly campLink: string | null;
  readonly athleticWebsite: string | null;
  readonly schoolWebsite: string | null;
  readonly address: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly sourceUrl: string | null;
  readonly coachNote: string | null;
}

const DIVISION_MAP: Record<string, Division> = {
  "Division I (D1)": "D1",
  "Division II (D2)": "D2",
  "Division III (D3)": "D3",
  "NAIA": "NAIA",
  "JUCO": "JUCO",
};

export function normalizeDivision(raw: string): Division | null {
  return DIVISION_MAP[raw.trim()] ?? null;
}

export function normalizeControl(raw: string): Control {
  const s = raw.trim().toLowerCase();
  if (s === "public") return "PUBLIC";
  if (s === "private") return "PRIVATE";
  return "UNKNOWN";
}

export function slug(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");
}

// Deterministic external id: name-slug + state-slug (natural key for upserts).
export function makeExtId(name: string, state: string): string {
  return `${slug(name)}__${slug(state)}`;
}

export function toRecord(r: Record<string, string>): SchoolRecord {
  const name = (r["School Name"] ?? "").trim();
  const state = (r["State"] ?? "").trim();
  const assistants = cleanText(r["Assistant Coaches"]);
  return {
    extId: makeExtId(name, state),
    name,
    city: (r["City"] ?? "").trim(),
    state,
    control: normalizeControl(r["Public/Private"] ?? ""),
    division: normalizeDivision(r["Division"] ?? "") ?? "JUCO",
    conference: cleanText(r["Conference"]),
    campusSetting: cleanText(r["Campus Setting"]),
    enrollment: parseCount(r["Enrollment"]),
    acceptanceRate: parsePercent(r["Acceptance Rate"]),
    retentionRate: parsePercent(r["Retention Rate"]),
    graduationRate: parsePercent(r["Graduation Rate"]),
    medianEarnings6yr: parseMoney(r["Median Earnings 6yr"]),
    medianEarnings10yr: parseMoney(r["Median Earnings 10yr"]),
    tuitionInState: parseMoney(r["Tuition In-State"]),
    tuitionOutState: parseMoney(r["Tuition Out-of-State"]),
    roomAndBoard: parseMoney(r["Room and Board"]),
    netCost: parseMoney(r["Net Cost"]),
    applicationFee: parseMoney(r["Application Fee"]),
    totalRevenue: parseMoney(r["Total Revenue"]),
    operatingExpenses: parseMoney(r["Operating Expenses"]),
    headCoach: cleanText(r["Head Coach"]),
    assistantCoaches: assistants ? assistants.split(";").map((x) => x.trim()).filter(Boolean) : [],
    recruitingCoordinator: cleanText(r["Recruiting Coordinator"]),
    rosterSize: parseCount(r["Roster Size"]),
    campLink: cleanText(r["Camp Link"]),
    athleticWebsite: cleanText(r["Athletic Website"]),
    schoolWebsite: cleanText(r["School Website"]),
    address: cleanText(r["Address"]),
    phone: cleanText(r["Phone"]),
    email: cleanText(r["Email"]),
    sourceUrl: cleanText(r["Source URL"]),
    coachNote: cleanText(r["Coach Note"]),
  };
}
