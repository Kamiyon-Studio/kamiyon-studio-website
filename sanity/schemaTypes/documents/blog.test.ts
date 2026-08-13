import { describe, expect, it } from "vitest";

import { post } from "./blog";

function fieldNames(type: typeof post): string[] {
  return (type.fields ?? []).map((field) => field.name);
}

describe("post schema (RFC §1.5 unused field removal)", () => {
  it("keeps core post fields for Studio editors", () => {
    const names = fieldNames(post);

    expect(names).toContain("title");
    expect(names).toContain("slug");
    expect(names).toContain("authors");
    expect(names).toContain("featuredImage");
    expect(names).toContain("body");
    expect(names).toContain("seo");
    expect(names).toContain("publishedAt");
    expect(names).toContain("updatedAt");
  });

  it("omits unused categories, tags, readingTimeMinutes, and relatedPosts", () => {
    const names = fieldNames(post);

    expect(names).not.toContain("categories");
    expect(names).not.toContain("tags");
    expect(names).not.toContain("readingTimeMinutes");
    expect(names).not.toContain("relatedPosts");
  });
});
