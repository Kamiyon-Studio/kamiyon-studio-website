import { describe, expect, it } from "vitest";

import { aboutPageFallback } from "./about";

describe("aboutPageFallback (Who we are band)", () => {
  it("populates mission, vision, motto, values, and cultureSummary", () => {
    expect(aboutPageFallback.mission.length).toBeGreaterThan(0);
    expect(aboutPageFallback.vision.length).toBeGreaterThan(0);
    expect(aboutPageFallback.motto.length).toBeGreaterThan(0);
    expect(aboutPageFallback.values.length).toBeGreaterThan(0);
    expect(aboutPageFallback.cultureSummary.length).toBeGreaterThan(0);

    for (const value of aboutPageFallback.values) {
      expect(value.name.length).toBeGreaterThan(0);
      expect(value.description.length).toBeGreaterThan(0);
    }
  });

  it("exposes cultureSummary (not culture) and optional teamIntro", () => {
    expect(aboutPageFallback).toHaveProperty("cultureSummary");
    expect(aboutPageFallback).not.toHaveProperty("culture");
    expect(aboutPageFallback).toHaveProperty("teamIntro");
  });

  it("keeps story, timeline, title, and seo content", () => {
    expect(aboutPageFallback.title).toBe("About");
    expect(aboutPageFallback.storySections.length).toBeGreaterThan(0);
    expect(aboutPageFallback.timelineHeading.length).toBeGreaterThan(0);
    expect(aboutPageFallback.timelineEntries.length).toBeGreaterThan(0);
    expect(aboutPageFallback.seo.title.length).toBeGreaterThan(0);
  });
});
