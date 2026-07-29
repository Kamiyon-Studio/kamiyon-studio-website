/**
 * Locked blog seed constants for Sanity content seed.
 * Post bodies/titles live in `lib/cms/fallbacks/posts.ts` (source of truth).
 */

import {
  authorId,
  blogCategoryId,
  postId,
  tagId,
} from "./ids";

/** Stable document IDs (`{type}-{slug}` — hyphen; see ids.ts). */
export const BLOG_SEED_IDS = {
  author: authorId("kamiyon-studio"),
  category: blogCategoryId("updates"),
  tagComingSoon: tagId("coming-soon"),
  tagAnnouncement: tagId("announcement"),
  /** Legacy single-stub id — still present among multi-post seeds. */
  post: postId("coming-soon"),
} as const;

export type BlogSeedId = (typeof BLOG_SEED_IDS)[keyof typeof BLOG_SEED_IDS];

/**
 * Author bio mirrors `siteSettingsFallback.tagline`
 * (lib/cms/fallbacks/site-settings.ts) — hardcoded so seed stays scripts-only.
 */
export const BLOG_AUTHOR_BIO =
  "Kamiyon Studio creates games and interactive experiences that educate, inspire, and make a lasting impact.";

/** @deprecated Prefer postsFallback publishedAt values. */
export const BLOG_SEED_PUBLISHED_AT = "2025-09-18T12:00:00.000Z";

export const blogAuthorSeed = {
  name: "Kamiyon Studio",
  slug: "kamiyon-studio",
  bio: BLOG_AUTHOR_BIO,
} as const;

export const blogCategorySeed = {
  title: "Updates",
  slug: "updates",
} as const;

export const blogTagSeeds = [
  { title: "Coming soon", slug: "coming-soon", id: BLOG_SEED_IDS.tagComingSoon },
  { title: "Announcement", slug: "announcement", id: BLOG_SEED_IDS.tagAnnouncement },
] as const;

/** @deprecated Prefer postsFallback. Kept for older test imports. */
export const blogPostSeed = {
  title: "Coming soon — Kamiyon Studio blog",
  slug: "coming-soon",
  publishedAt: BLOG_SEED_PUBLISHED_AT,
  readingTimeMinutes: 1,
  seo: {
    title: "Coming Soon | Kamiyon Studio Blog",
    description:
      "The Kamiyon Studio blog is launching soon. Check back for studio updates, announcements, and behind-the-scenes notes.",
    noIndex: false,
  },
  bodyParagraphs: [
    "The Kamiyon Studio blog is launching soon.",
    "We will share studio updates, product notes, and announcements here. This post is a placeholder so editors can see the full author, category, tag, SEO, and body field structure.",
    "Check back shortly — Create. Play. Inspire.",
  ],
} as const;
