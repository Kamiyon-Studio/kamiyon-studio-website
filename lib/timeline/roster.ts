import type { RosterMember, TimelineEntryV2 } from "./types";

/**
 * Roster members for the given set of passed entry keys, in timeline order.
 * Pure: no DOM, no observers. News entries contribute nothing.
 * Duplicate teamMember ids collapse to their first appearance.
 */
export function buildCumulativeRoster(
  entries: readonly TimelineEntryV2[],
  passedKeys: ReadonlySet<string>,
): RosterMember[] {
  const seen = new Set<string>();
  const roster: RosterMember[] = [];

  for (const entry of entries) {
    if (entry.entryType !== "teamJoin" || !passedKeys.has(entry.key)) {
      continue;
    }

    const member = entry.rosterMember;
    if (!member) {
      continue;
    }

    if (seen.has(member.id)) {
      continue;
    }

    seen.add(member.id);
    roster.push(member);
  }

  return roster;
}

/** Every roster member, ignoring scroll state — reduced-motion + SSR fallback. */
export function buildFullRoster(
  entries: readonly TimelineEntryV2[],
): RosterMember[] {
  return buildCumulativeRoster(
    entries,
    new Set(entries.map((entry) => entry.key)),
  );
}
