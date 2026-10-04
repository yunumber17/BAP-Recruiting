// Minimal RFC-4180 CSV parser: handles quoted fields, embedded commas,
// escaped double-quotes ("") and CRLF/LF line endings. No dependencies.

export interface CsvTable {
  readonly header: readonly string[];
  readonly rows: readonly Record<string, string>[];
}

export function parseCsv(text: string): CsvTable {
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const src = text.replace(/^﻿/, ""); // strip BOM

  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      records.push(row); row = [];
    } else if (c === "\r") {
      // swallow; \n handles the break
    } else field += c;
  }
  if (field !== "" || row.length > 0) { row.push(field); records.push(row); }

  const [head, ...body] = records;
  if (!head) return { header: [], rows: [] };
  const header = head.map((h) => h.trim());
  const rows = body
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => {
      const obj: Record<string, string> = {};
      header.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
      return obj;
    });
  return { header, rows };
}
