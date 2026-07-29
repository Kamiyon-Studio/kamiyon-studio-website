import { describe, expect, it } from "vitest";

import { teamMemberId } from "../ids";
import { BLOG_SEED_IDS, BLOG_SEED_PUBLISHED_AT } from "../seed-data.blog";
import type { SanityReference } from "../types";
import {
  buildBlogPostDocument,
  buildBlogSeedDocuments,
  listBlogSeedDocumentIds,
} from "./blog";

function refsOf(field: unknown): SanityReference[] {
  if (!Array.isArray(field)) {
    return [];
  }
  return field.filter(
    (item): item is SanityReference =>
      typeof item === "object" &&
      item !== null &&
      (item as SanityReference)._type === "reference" &&
      typeof (item as SanityReference)._ref === "string",
  );
}

describe("blog seed builders (teamMember authors + string taxonomies)", () => {
  it("builds post with teamMember author refs and string categories/tags", () => {
    const post = buildBlogPostDocument();
    const authorId = teamMemberId("Sherwin Limosnero");

    expect(post._id).toBe(BLOG_SEED_IDS.post);
    expect(post._type).toBe("post");
    expect(post).toMatchObject({
      title: "Coming Soon",
      slug: { _type: "slug", current: "coming-soon" },
      publishedAt: BLOG_SEED_PUBLISHED_AT,
      readingTimeMinutes: 1,
      categories: ["updates"],
      tags: ["coming-soon", "announcement"],
      seo: {
        title: "Coming Soon | Kamiyon Studio Blog",
        noIndex: false,
      },
    });

    expect(refsOf(post.authors).map((ref) => ref._ref)).toEqual([authorId]);
    expect(Array.isArray(post.body)).toBe(true);
    expect((post.body as unknown[]).length).toBeGreaterThanOrEqual(1);
    expect(post).not.toHaveProperty("featuredImage");
  });

  it("seeds only the post document (archived taxonomy docs omitted)", () => {
    const docs = buildBlogSeedDocuments();
    const ids = docs.map((doc) => doc._id);

    expect(ids).toEqual([BLOG_SEED_IDS.post]);
    expect(listBlogSeedDocumentIds()).toEqual(ids);
  });
});
