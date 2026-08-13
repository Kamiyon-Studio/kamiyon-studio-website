import { describe, expect, it } from "vitest";

import { aboutPageFallback } from "@/lib/cms/fallbacks/about";

import { buildAboutPageDocument } from "./about";

describe("buildAboutPageDocument (Who we are band)", () => {
  it("seeds mission, vision, motto, values, and cultureSummary from fallback", () => {
    const doc = buildAboutPageDocument();

    expect(doc.mission).toBe(aboutPageFallback.mission);
    expect(doc.vision).toBe(aboutPageFallback.vision);
    expect(doc.motto).toBe(aboutPageFallback.motto);
    expect(doc.cultureSummary).toBe(aboutPageFallback.cultureSummary);
    expect(doc).not.toHaveProperty("culture");

    expect(doc.values).toEqual(
      aboutPageFallback.values.map((value, index) => ({
        _type: "coreValue",
        _key: `value-${index}`,
        name: value.name,
        description: value.description,
      })),
    );
  });

  it("includes teamIntro only when present on the source", () => {
    const withoutIntro = buildAboutPageDocument({
      ...aboutPageFallback,
      teamIntro: undefined,
    });
    expect(withoutIntro).not.toHaveProperty("teamIntro");

    const withIntro = buildAboutPageDocument({
      ...aboutPageFallback,
      teamIntro: "Meet the people behind Kamiyon.",
    });
    expect(withIntro.teamIntro).toBe("Meet the people behind Kamiyon.");
  });

  it("preserves story, timeline, title, and seo on the seed document", () => {
    const doc = buildAboutPageDocument();

    expect(doc._id).toBe("aboutPage");
    expect(doc._type).toBe("aboutPage");
    expect(doc.title).toBe(aboutPageFallback.title);
    expect(doc.timelineHeading).toBe(aboutPageFallback.timelineHeading);
    expect(Array.isArray(doc.storySections)).toBe(true);
    expect(Array.isArray(doc.timelineEntries)).toBe(true);
    expect(doc.seo).toMatchObject({
      title: aboutPageFallback.seo.title,
      description: aboutPageFallback.seo.description,
    });
  });
});
