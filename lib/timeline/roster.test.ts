import { describe, expect, it } from "vitest";

import { buildCumulativeRoster, buildFullRoster } from "./roster";
import type { RosterMember, TimelineEntryV2 } from "./types";

const member = (
  id: string,
  name: string,
  role = "Role",
): RosterMember => ({
  id,
  name,
  role,
  photo: null,
});

const news = (key: string, year = "2024"): TimelineEntryV2 => ({
  key,
  entryType: "news",
  year,
  dateLabel: "March 2024",
  title: "News",
  body: "Body",
  images: [{ src: "/a.jpg", alt: "a" }],
});

const join = (
  key: string,
  rosterMember: RosterMember,
  year = "2024",
): TimelineEntryV2 => ({
  key,
  entryType: "teamJoin",
  year,
  dateLabel: "March 2024",
  title: `${rosterMember.name} joins`,
  body: "Body",
  images: [{ src: "/a.jpg", alt: "a" }],
  rosterMember,
});

const alice = member("alice", "Alice");
const bob = member("bob", "Bob");
const carol = member("carol", "Carol");

describe("buildCumulativeRoster", () => {
  it("returns empty for empty entries", () => {
    expect(buildCumulativeRoster([], new Set())).toEqual([]);
  });

  it("returns empty when no keys have passed", () => {
    const entries = [join("j1", alice), join("j2", bob)];
    expect(buildCumulativeRoster(entries, new Set())).toEqual([]);
  });

  it("ignores news entries even when their keys are passed", () => {
    const entries = [news("n1"), join("j1", alice)];
    expect(buildCumulativeRoster(entries, new Set(["n1"]))).toEqual([]);
  });

  it("returns passed joins in timeline order", () => {
    const entries = [join("j1", alice), join("j2", bob), join("j3", carol)];
    expect(buildCumulativeRoster(entries, new Set(["j3", "j1"]))).toEqual([
      alice,
      carol,
    ]);
  });

  it("dedupes the same teamMember id to first appearance", () => {
    const entries = [
      join("j1", alice),
      join("j2", { ...alice, name: "Alice Again" }),
    ];
    expect(buildCumulativeRoster(entries, new Set(["j1", "j2"]))).toEqual([
      alice,
    ]);
  });

  it("skips teamJoin entries without rosterMember", () => {
    const orphan: TimelineEntryV2 = {
      key: "orphan",
      entryType: "teamJoin",
      year: "2024",
      dateLabel: "March 2024",
      title: "Orphan",
      body: "Body",
      images: [{ src: "/a.jpg", alt: "a" }],
    };
    expect(
      buildCumulativeRoster([orphan, join("j1", alice)], new Set(["orphan", "j1"])),
    ).toEqual([alice]);
  });

  it("returns a fresh array and does not mutate inputs", () => {
    const entries = [join("j1", alice)];
    const passed = new Set(["j1"]);
    const first = buildCumulativeRoster(entries, passed);
    const second = buildCumulativeRoster(entries, passed);
    expect(first).toEqual([alice]);
    expect(second).toEqual([alice]);
    expect(first).not.toBe(second);
    expect(entries[0]?.rosterMember).toBe(alice);
  });
});

describe("buildFullRoster", () => {
  it("returns every join member regardless of scroll state", () => {
    const entries = [news("n1"), join("j1", alice), join("j2", bob)];
    expect(buildFullRoster(entries)).toEqual([alice, bob]);
  });

  it("returns empty for empty entries", () => {
    expect(buildFullRoster([])).toEqual([]);
  });
});
