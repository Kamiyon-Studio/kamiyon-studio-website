import { describe, expect, it } from "vitest";

import { postsFallback } from "./posts";

describe("postsFallback", () => {
  it("provides at least ten placeholder posts with unique publishedAt values", () => {
    expect(postsFallback.length).toBeGreaterThanOrEqual(10);

    const publishedAts = postsFallback.map((post) => post.publishedAt);
    expect(publishedAts.every((value) => typeof value === "string")).toBe(true);
    expect(new Set(publishedAts).size).toBe(postsFallback.length);

    const slugs = postsFallback.map((post) => post.slug.current);
    expect(new Set(slugs).size).toBe(postsFallback.length);
  });
});
