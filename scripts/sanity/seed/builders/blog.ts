/**
 * Pure blog seed builders: postsFallback → Sanity createOrReplace docs.
 * Authors reference teamMember; categories/tags are string taxonomy values.
 */

import { postsFallback } from "@/lib/cms/fallbacks/posts";
import type { BlogBodyBlock, PortableTextBlock, Post } from "@/lib/cms/types";

import { arrayKey, toPortableBody, toReference, toSeo, toSlug } from "../helpers";
import { postId, teamMemberId } from "../ids";
import {
  BLOG_SEED_IDS,
  blogAuthorSeed,
  blogCategorySeed,
  blogTagSeeds,
} from "../seed-data.blog";
import type { SeedDocument } from "../types";

function isPortableTextBlock(block: BlogBodyBlock): block is PortableTextBlock {
  return block._type === "block";
}

export function buildBlogPostDocument(
  post: Post = postsFallback.find((row) => row.slug.current === "coming-soon") ??
    postsFallback[0]!,
): SeedDocument {
  const bodyBlocks = post.body.filter(isPortableTextBlock);
  const body =
    bodyBlocks.length > 0
      ? toPortableBody(bodyBlocks, `post-${post.slug.current}`)
      : [
          {
            _type: "block" as const,
            _key: arrayKey(`post-${post.slug.current}-p`, 0),
            style: "normal",
            markDefs: [],
            children: [
              {
                _type: "span" as const,
                _key: arrayKey(`post-${post.slug.current}-p-0-span`, 0),
                text: post.title,
              },
            ],
          },
        ];

  const authorName = post.authors[0]?.name ?? "Sherwin Limosnero";

  return {
    _id: postId(post.slug.current),
    _type: "post",
    title: post.title,
    slug: toSlug(post.slug.current),
    authors: [toReference(teamMemberId(authorName), "author-team-member")],
    categories: post.categories.map((category) => category.slug.current),
    tags: post.tags.map((tag) => tag.slug.current),
    body,
    seo: toSeo(post.seo),
    ...(typeof post.readingTimeMinutes === "number"
      ? { readingTimeMinutes: post.readingTimeMinutes }
      : {}),
    publishedAt: post.publishedAt,
    ...(post.updatedAt ? { updatedAt: post.updatedAt } : {}),
  };
}

/**
 * Ordered blog upsert list: posts only (taxonomy strings + teamMember author).
 * Archived author/category/tag docs are not seeded.
 */
export function buildBlogSeedDocuments(
  source: Post[] = postsFallback,
): SeedDocument[] {
  return source.map((post) => buildBlogPostDocument(post));
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
    name: blogAuthorSeed.name,
    slug: toSlug(blogAuthorSeed.slug),
  };
}

/** @deprecated Archived — category docs are no longer seeded. */
export function buildBlogCategoryDocument(): SeedDocument {
  return {
    _id: BLOG_SEED_IDS.category,
    _type: "category",
    title: blogCategorySeed.title,
    slug: toSlug(blogCategorySeed.slug),
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
