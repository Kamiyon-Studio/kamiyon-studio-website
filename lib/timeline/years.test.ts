import { describe, expect, it } from "vitest";

import type { TimelineEntryV2 } from "./types";
import { activeYearFromEntryKey, buildYearRail } from "./years";

const entry = (key: string, year: string): TimelineEntryV2 => ({
  key,
  entryType: "news",
  year,
  dateLabel: `${year}`,
  title: key,
  body: "Body",
  images: [{ src: "/a.jpg", alt: "a" }],
});

describe("buildYearRail", () => {
  it("returns empty for empty entries", () => {
    expect(buildYearRail([])).toEqual([]);
  });

  it("collapses repeat years into one rail item", () => {
    const rail = buildYearRail([
      entry("a", "2025"),
      entry("b", "2025"),
      entry("c", "2025"),
    ]);
    expect(rail).toEqual([
      {
        year: "2025",
        firstEntryKey: "a",
        entryKeys: ["a", "b", "c"],
      },
    ]);
  });

  it("follows array order and never re-sorts numerically", () => {
    const rail = buildYearRail([
      entry("late", "2027"),
      entry("early", "2024"),
      entry("mid", "2025"),
    ]);
    expect(rail.map((item) => item.year)).toEqual(["2027", "2024", "2025"]);
    expect(rail[0]?.firstEntryKey).toBe("late");
  });
});

describe("activeYearFromEntryKey", () => {
  const rail = buildYearRail([
    entry("a", "2024"),
    entry("b", "2025"),
    entry("c", "2025"),
  ]);

  it("returns null for a null entry key", () => {
    expect(activeYearFromEntryKey(rail, null)).toBeNull();
  });

  it("returns null for an unknown key without throwing", () => {
    expect(activeYearFromEntryKey(rail, "missing")).toBeNull();
  });

  it("returns the year owning the active entry key", () => {
    expect(activeYearFromEntryKey(rail, "c")).toBe("2025");
    expect(activeYearFromEntryKey(rail, "a")).toBe("2024");
  });
});
