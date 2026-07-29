/**
 * Pure blog seed builders: locked constants → Sanity createOrReplace docs.
 * Authors reference teamMember; categories/tags are string taxonomy values.
 */

import { arrayKey, toReference, toSlug } from "../helpers";
import { teamMemberId } from "../ids";
import {
  BLOG_SEED_IDS,
  blogPostSeed,
  blogTagSeeds,
} from "../seed-data.blog";
import type { SanityPortableBlock, SeedDocument } from "../types";

function paragraphBlock(index: number, text: string): SanityPortableBlock {
  return {
    _type: "block",
    _key: arrayKey("post-coming-soon-p", index),
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: arrayKey(`post-coming-soon-p-${index}-span`, 0),
        text,
        marks: [],
      },
    ],
  };
}

/** Default byline author — first team member (CEO). */
const DEFAULT_AUTHOR_ID = teamMemberId("Sherwin Limosnero");

export function buildBlogPostDocument(): SeedDocument {
  const body = blogPostSeed.bodyParagraphs.map((text, index) =>
    paragraphBlock(index, text),
  );

  return {
    _id: BLOG_SEED_IDS.post,
    _type: "post",
    title: blogPostSeed.title,
    slug: toSlug(blogPostSeed.slug),
    authors: [toReference(DEFAULT_AUTHOR_ID, "author-team-member")],
    categories: ["updates"],
    tags: blogTagSeeds.map((tag) => tag.slug),
    body,
    seo: {
      title: blogPostSeed.seo.title,
      description: blogPostSeed.seo.description,
      noIndex: blogPostSeed.seo.noIndex,
    },
    readingTimeMinutes: blogPostSeed.readingTimeMinutes,
    publishedAt: blogPostSeed.publishedAt,
  };
}

/**
 * Ordered blog upsert list: post only (taxonomy strings + teamMember author).
 * Archived author/category/tag docs are not seeded.
 */
export function buildBlogSeedDocuments(): SeedDocument[] {
  return [buildBlogPostDocument()];
}

/** Stable `_id` list for dry-run / CLI logging. */
export function listBlogSeedDocumentIds(): string[] {
  return buildBlogSeedDocuments().map((doc) => doc._id);
}

/** @deprecated Archived — author docs are no longer seeded. */
export function buildBlogAuthorDocument(): SeedDocument {
  return {
    _id: BLOG_SEED_IDS.author,
    _type: "author",
    name: "Kamiyon Studio",
    slug: toSlug("kamiyon-studio"),
  };
}

/** @deprecated Archived — category docs are no longer seeded. */
export function buildBlogCategoryDocument(): SeedDocument {
  return {
    _id: BLOG_SEED_IDS.category,
    _type: "category",
    title: "Updates",
    slug: toSlug("updates"),
  };
}

/** @deprecated Archived — tag docs are no longer seeded. */
export function buildBlogTagDocuments(): SeedDocument[] {
  return blogTagSeeds.map((tag) => ({
    _id: tag.id,
    _type: "tag",
    title: tag.title,
    slug: toSlug(tag.slug),
  }));
}
