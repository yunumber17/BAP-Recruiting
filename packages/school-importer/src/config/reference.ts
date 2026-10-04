/** Canonical reference data + normalizers for Schools. Editable in one place. */

export const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'] as const;
export type Division = (typeof DIVISIONS)[number];

export const REGIONS = ['WEST', 'MIDWEST', 'SOUTH', 'NORTHEAST'] as const;
export type Region = (typeof REGIONS)[number];

/** Map many source spellings of division onto the canonical enum. */
const DIVISION_ALIASES: Record<string, Division> = {
  'NCAA D1': 'D1', 'NCAA DI': 'D1', 'DIVISION 1': 'D1', 'DIVISION I': 'D1', D1: 'D1', DI: 'D1',
  'NCAA D2': 'D2', 'NCAA DII': 'D2', 'DIVISION 2': 'D2', 'DIVISION II': 'D2', D2: 'D2', DII: 'D2',
  'NCAA D3': 'D3', 'NCAA DIII': 'D3', 'DIVISION 3': 'D3', 'DIVISION III': 'D3', D3: 'D3', DIII: 'D3',
  NAIA: 'NAIA',
  JC: 'JUCO', JUCO: 'JUCO', NJCAA: 'JUCO', CCCAA: 'JUCO', 'JUNIOR COLLEGE': 'JUCO',
};

export function normalizeDivision(input: string): Division | null {
  return DIVISION_ALIASES[input.trim().toUpperCase()] ?? null;
}

export const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA',
  'RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]);

const STATE_NAME_TO_ABBR: Record<string, string> = {
  ALABAMA: 'AL', ALASKA: 'AK', ARIZONA: 'AZ', ARKANSAS: 'AR', CALIFORNIA: 'CA', COLORADO: 'CO',
  CONNECTICUT: 'CT', DELAWARE: 'DE', FLORIDA: 'FL', GEORGIA: 'GA', HAWAII: 'HI', IDAHO: 'ID',
  ILLINOIS: 'IL', INDIANA: 'IN', IOWA: 'IA', KANSAS: 'KS', KENTUCKY: 'KY', LOUISIANA: 'LA',
  MAINE: 'ME', MARYLAND: 'MD', MASSACHUSETTS: 'MA', MICHIGAN: 'MI', MINNESOTA: 'MN',
  MISSISSIPPI: 'MS', MISSOURI: 'MO', MONTANA: 'MT', NEBRASKA: 'NE', NEVADA: 'NV',
  'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
  'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', OHIO: 'OH', OKLAHOMA: 'OK', OREGON: 'OR',
  PENNSYLVANIA: 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD',
  TENNESSEE: 'TN', TEXAS: 'TX', UTAH: 'UT', VERMONT: 'VT', VIRGINIA: 'VA', WASHINGTON: 'WA',
  'WEST VIRGINIA': 'WV', WISCONSIN: 'WI', WYOMING: 'WY', 'DISTRICT OF COLUMBIA': 'DC',
};

export function normalizeState(input: string): string | null {
  const t = input.trim().toUpperCase().replace(/\./g, '');
  if (US_STATES.has(t)) return t;
  return STATE_NAME_TO_ABBR[t] ?? null;
}

const STATE_REGION: Record<string, Region> = {
  CA:'WEST',OR:'WEST',WA:'WEST',AZ:'WEST',NV:'WEST',CO:'WEST',UT:'WEST',NM:'WEST',ID:'WEST',
  MT:'WEST',WY:'WEST',AK:'WEST',HI:'WEST',
  IL:'MIDWEST',IN:'MIDWEST',IA:'MIDWEST',KS:'MIDWEST',MI:'MIDWEST',MN:'MIDWEST',MO:'MIDWEST',
  NE:'MIDWEST',ND:'MIDWEST',SD:'MIDWEST',OH:'MIDWEST',WI:'MIDWEST',
  TX:'SOUTH',OK:'SOUTH',AR:'SOUTH',LA:'SOUTH',MS:'SOUTH',AL:'SOUTH',TN:'SOUTH',KY:'SOUTH',
  GA:'SOUTH',FL:'SOUTH',SC:'SOUTH',NC:'SOUTH',VA:'SOUTH',WV:'SOUTH',MD:'SOUTH',DE:'SOUTH',DC:'SOUTH',
  NY:'NORTHEAST',NJ:'NORTHEAST',PA:'NORTHEAST',CT:'NORTHEAST',RI:'NORTHEAST',MA:'NORTHEAST',
  VT:'NORTHEAST',NH:'NORTHEAST',ME:'NORTHEAST',
};

export function regionForState(state: string): Region | null {
  return STATE_REGION[state] ?? null;
}
