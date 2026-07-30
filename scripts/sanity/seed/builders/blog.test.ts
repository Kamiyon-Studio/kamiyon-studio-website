import { describe, expect, it } from "vitest";

import { postsFallback } from "@/lib/cms/fallbacks/posts";
import { teamMemberId } from "../ids";
import { BLOG_SEED_IDS } from "../seed-data.blog";
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
  it("builds each fallback post with teamMember author and string taxonomies", () => {
    const comingSoon =
      postsFallback.find((post) => post.slug.current === "coming-soon") ??
      postsFallback[0]!;
    const post = buildBlogPostDocument(comingSoon);
    const authorId = teamMemberId("Sherwin Limosnero");

    expect(post._id).toBe(BLOG_SEED_IDS.post);
    expect(post._type).toBe("post");
    expect(post).toMatchObject({
      title: comingSoon.title,
      slug: { _type: "slug", current: "coming-soon" },
      publishedAt: comingSoon.publishedAt,
      readingTimeMinutes: 1,
      categories: ["updates"],
      tags: ["coming-soon", "announcement"],
      seo: {
        title: comingSoon.seo.title,
        noIndex: false,
      },
    });

    expect(refsOf(post.authors).map((ref) => ref._ref)).toEqual([authorId]);
    expect(Array.isArray(post.body)).toBe(true);
    expect((post.body as unknown[]).length).toBeGreaterThanOrEqual(1);
    expect(post).not.toHaveProperty("featuredImage");
  });

  it("seeds at least 10 posts with distinct publishedAt values", () => {
    const docs = buildBlogSeedDocuments();
    const ids = docs.map((doc) => doc._id);
    const publishedAts = docs.map((doc) => doc.publishedAt);

    expect(docs.length).toBeGreaterThanOrEqual(10);
    expect(new Set(publishedAts).size).toBe(docs.length);
    expect(ids).toContain(BLOG_SEED_IDS.post);
    expect(listBlogSeedDocumentIds()).toEqual(ids);
  });
});
