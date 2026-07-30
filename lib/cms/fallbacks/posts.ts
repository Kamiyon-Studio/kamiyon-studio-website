import type { BlogBodyBlock, Post, TeamMember } from "../types";
import { teamMembersFallback } from "./about";

const placeholderAuthor: TeamMember = teamMembersFallback[0]!;

function paragraph(text: string): BlogBodyBlock {
  return {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text }],
    markDefs: [],
  };
}

function postBody(...paragraphs: string[]): BlogBodyBlock[] {
  return paragraphs.map(paragraph);
}

/**
 * Placeholder blog posts for `/blog` when Sanity is empty or unreachable.
 * Dates are intentionally staggered so listing order and datetime UI can be verified.
 */
export const postsFallback: Post[] = [
  {
    _type: "post",
    title: "Studio notes — July update",
    slug: { current: "studio-notes-july-update" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [
      { title: "Announcement", slug: { current: "announcement" } },
    ],
    body: postBody(
      "Placeholder post for the Kamiyon Studio blog. Real studio notes will replace this entry once approved.",
      "Create. Play. Inspire.",
    ),
    seo: {
      title: "Studio notes — July update | Kamiyon Studio",
      description:
        "Placeholder July studio update from Kamiyon Studio. Content coming soon.",
      noIndex: false,
    },
    readingTimeMinutes: 1,
    publishedAt: "2026-07-24T10:00:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Behind the build — process placeholders",
    slug: { current: "behind-the-build-process-placeholders" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [{ title: "Coming soon", slug: { current: "coming-soon" } }],
    body: postBody(
      "A reserved slot for future behind-the-scenes process write-ups from the studio.",
    ),
    seo: {
      title: "Behind the build | Kamiyon Studio",
      description: "Placeholder process post for Kamiyon Studio.",
      noIndex: false,
    },
    readingTimeMinutes: 2,
    publishedAt: "2026-06-18T14:30:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Community spotlight — placeholder",
    slug: { current: "community-spotlight-placeholder" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [{ title: "Announcement", slug: { current: "announcement" } }],
    body: postBody(
      "Community stories will appear here once events and partners are ready to publish.",
    ),
    seo: {
      title: "Community spotlight | Kamiyon Studio",
      description: "Placeholder community spotlight for Kamiyon Studio.",
      noIndex: false,
    },
    readingTimeMinutes: 1,
    publishedAt: "2026-05-09T09:15:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Design craft notes — coming soon",
    slug: { current: "design-craft-notes-coming-soon" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [{ title: "Coming soon", slug: { current: "coming-soon" } }],
    body: postBody(
      "UI and branding craft notes will replace this placeholder when the series launches.",
    ),
    seo: {
      title: "Design craft notes | Kamiyon Studio",
      description: "Placeholder design craft post for Kamiyon Studio.",
      noIndex: false,
    },
    readingTimeMinutes: 2,
    publishedAt: "2026-04-22T16:45:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Game jam reflections — placeholder",
    slug: { current: "game-jam-reflections-placeholder" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [{ title: "Announcement", slug: { current: "announcement" } }],
    body: postBody(
      "Jam postmortems and shipping lessons will live here after each event is documented.",
    ),
    seo: {
      title: "Game jam reflections | Kamiyon Studio",
      description: "Placeholder game jam reflections for Kamiyon Studio.",
      noIndex: false,
    },
    readingTimeMinutes: 3,
    publishedAt: "2026-03-11T11:00:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Education track — early outline",
    slug: { current: "education-track-early-outline" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [{ title: "Coming soon", slug: { current: "coming-soon" } }],
    body: postBody(
      "Placeholder outline for future education and workshop updates from Kamiyon Studio.",
    ),
    seo: {
      title: "Education track | Kamiyon Studio",
      description: "Placeholder education update for Kamiyon Studio.",
      noIndex: false,
    },
    readingTimeMinutes: 1,
    publishedAt: "2026-02-27T08:20:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Product development diary — stub",
    slug: { current: "product-development-diary-stub" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [{ title: "Announcement", slug: { current: "announcement" } }],
    body: postBody(
      "MVP and product diary entries will replace this stub as work is cleared for publication.",
    ),
    seo: {
      title: "Product development diary | Kamiyon Studio",
      description: "Placeholder product diary for Kamiyon Studio.",
      noIndex: false,
    },
    readingTimeMinutes: 2,
    publishedAt: "2026-01-30T13:10:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Brand system notes — reserved",
    slug: { current: "brand-system-notes-reserved" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [{ title: "Coming soon", slug: { current: "coming-soon" } }],
    body: postBody(
      "Reserved slot for brand system and visual identity write-ups.",
    ),
    seo: {
      title: "Brand system notes | Kamiyon Studio",
      description: "Placeholder brand notes for Kamiyon Studio.",
      noIndex: false,
    },
    readingTimeMinutes: 1,
    publishedAt: "2025-12-12T17:00:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Partnerships desk — placeholder brief",
    slug: { current: "partnerships-desk-placeholder-brief" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [{ title: "Announcement", slug: { current: "announcement" } }],
    body: postBody(
      "Partnership announcements will publish here once details are approved.",
    ),
    seo: {
      title: "Partnerships desk | Kamiyon Studio",
      description: "Placeholder partnerships brief for Kamiyon Studio.",
      noIndex: false,
    },
    readingTimeMinutes: 1,
    publishedAt: "2025-11-05T07:40:00.000Z",
    relatedPostSlugs: [],
  },
  {
    _type: "post",
    title: "Coming soon — Kamiyon Studio blog",
    slug: { current: "coming-soon" },
    authors: [placeholderAuthor],
    categories: [{ title: "Updates", slug: { current: "updates" } }],
    tags: [
      { title: "Coming soon", slug: { current: "coming-soon" } },
      { title: "Announcement", slug: { current: "announcement" } },
    ],
    body: postBody(
      "The Kamiyon Studio blog is launching soon.",
      "We will share studio updates, product notes, and announcements here. This post is a placeholder so editors can see the full author, category, tag, SEO, and body field structure.",
      "Check back shortly — Create. Play. Inspire.",
    ),
    seo: {
      title: "Coming Soon | Kamiyon Studio Blog",
      description:
        "The Kamiyon Studio blog is launching soon. Check back for studio updates, announcements, and behind-the-scenes notes.",
      noIndex: false,
    },
    readingTimeMinutes: 1,
    publishedAt: "2025-09-18T12:00:00.000Z",
    relatedPostSlugs: [],
  },
];
