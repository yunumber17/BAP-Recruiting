import { describe, it, expect } from "vitest";
import { parseMoney, parsePercent, parseCount, cleanText } from "../src/statistics/parse.js";
import { describe as summarize, outlierBounds } from "../src/statistics/describe.js";
import { parseCsv } from "../src/profiler/csv.js";

describe("parsers", () => {
  it("parses money with $ and commas", () => {
    expect(parseMoney("$43,900")).toBe(43900);
    expect(parseMoney("$2,616")).toBe(2616);
    expect(parseMoney("")).toBeNull();
    expect(parseMoney(null)).toBeNull();
    expect(parseMoney("n/a")).toBeNull();
  });
  it("parses percents", () => {
    expect(parsePercent("66%")).toBe(66);
    expect(parsePercent("100% (open admission)")).toBe(100);
    expect(parsePercent("")).toBeNull();
  });
  it("parses counts", () => {
    expect(parseCount("5,872")).toBe(5872);
    expect(parseCount("41")).toBe(41);
    expect(parseCount("")).toBeNull();
  });
  it("cleanText trims and nulls empties", () => {
    expect(cleanText("  x ")).toBe("x");
    expect(cleanText("   ")).toBeNull();
  });
});

describe("statistics", () => {
  it("summarizes", () => {
    const s = summarize([1, 2, 3, 4]);
    expect(s.n).toBe(4);
    expect(s.mean).toBe(2.5);
    expect(s.median).toBe(2.5);
    expect(s.min).toBe(1);
    expect(s.max).toBe(4);
  });
  it("ignores nulls", () => {
    const s = summarize([null, 10, null, 20]);
    expect(s.n).toBe(2);
    expect(s.mean).toBe(15);
  });
  it("computes outlier bounds", () => {
    const b = outlierBounds([10, 11, 12, 13, 14, 1000]);
    expect(b).not.toBeNull();
    expect(b!.hi).toBeLessThan(1000);
  });
});

describe("csv parser", () => {
  it("handles quoted fields with commas", () => {
    const t = parseCsv('a,b\n"1,000",x\n');
    expect(t.header).toEqual(["a", "b"]);
    expect(t.rows[0]).toEqual({ a: "1,000", b: "x" });
  });
  it("handles escaped quotes", () => {
    const t = parseCsv('a\n"he said ""hi"""\n');
    expect(t.rows[0]!.a).toBe('he said "hi"');
  });
});
