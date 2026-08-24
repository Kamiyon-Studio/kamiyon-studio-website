import { describe, expect, it } from "vitest";

import { aboutPage } from "./aboutPage";

const WHO_WE_ARE_FIELDS = [
  "mission",
  "vision",
  "motto",
  "values",
  "cultureSummary",
  "teamIntro",
] as const;

function fieldNames(): string[] {
  return (aboutPage.fields ?? []).map((field) => field.name);
}

function fieldByName(name: string) {
  return (aboutPage.fields ?? []).find((field) => field.name === name);
}

describe("aboutPage schema (Who we are band)", () => {
  it("keeps Who we are fields including cultureSummary (not culture)", () => {
    const names = fieldNames();

    for (const name of WHO_WE_ARE_FIELDS) {
      expect(names).toContain(name);
    }
    expect(names).not.toContain("culture");
  });

  it("keeps story, timeline, title, and seo fields", () => {
    const names = fieldNames();

    expect(names).toContain("title");
    expect(names).toContain("storySections");
    expect(names).toContain("timelineHeading");
    expect(names).toContain("timelineSummary");
    expect(names).toContain("timelineEntries");
    expect(names).toContain("seo");
  });

  it("documents that Who we are fields appear in the /about Who we are band", () => {
    for (const name of WHO_WE_ARE_FIELDS) {
      const field = fieldByName(name);
      expect(field, `missing field ${name}`).toBeDefined();
      expect(field?.description, `${name} needs a Studio description`).toEqual(
        expect.stringMatching(/who we are/i),
      );
    }
  });

  it("types cultureSummary as text and values as coreValue array", () => {
    const culture = fieldByName("cultureSummary");
    const values = fieldByName("values");

    expect(culture?.type).toBe("text");
    expect(values?.type).toBe("array");
    expect(values?.of).toEqual([{ type: "coreValue" }]);
  });
});
