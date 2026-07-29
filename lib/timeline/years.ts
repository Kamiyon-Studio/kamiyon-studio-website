import type { TimelineEntryV2, YearRailItem } from "./types";

export function buildYearRail(
  entries: readonly TimelineEntryV2[],
): YearRailItem[] {
  const rail: YearRailItem[] = [];
  const byYear = new Map<string, YearRailItem>();

  for (const entry of entries) {
    const existing = byYear.get(entry.year);
    if (existing) {
      byYear.set(entry.year, {
        ...existing,
        entryKeys: [...existing.entryKeys, entry.key],
      });
      const index = rail.findIndex((item) => item.year === entry.year);
      if (index >= 0) {
        rail[index] = byYear.get(entry.year)!;
      }
      continue;
    }

    const item: YearRailItem = {
      year: entry.year,
      firstEntryKey: entry.key,
      entryKeys: [entry.key],
    };
    byYear.set(entry.year, item);
    rail.push(item);
  }

  return rail;
}

/** Year of the entry currently considered active; null when nothing passed yet. */
export function activeYearFromEntryKey(
  rail: readonly YearRailItem[],
  entryKey: string | null,
): string | null {
  if (!entryKey) {
    return null;
  }

  for (const item of rail) {
    if (item.entryKeys.includes(entryKey)) {
      return item.year;
    }
  }

  return null;
}
