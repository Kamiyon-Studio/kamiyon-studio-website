import { describe, expect, it } from "vitest";

import type { Post } from "@/lib/cms/types";

import { getBlogPostingJsonLd } from "./blog-posting-jsonld";

const basePost: Post = {
  _type: "post",
  title: "Studio notes — July update",
  slug: { current: "studio-notes-july-update" },
  authors: [
    {
      _type: "teamMember",
      name: "Founder",
      role: "Founder",
      bio: "Bio",
      socialLinks: [],
      order: 1,
      isPlaceholder: true,
    },
  ],
  categories: [],
  tags: [],
  body: [],
  seo: {
    title: "Studio notes",
    description: "July studio update.",
  },
  publishedAt: "2026-07-24T10:00:00.000Z",
  relatedPostSlugs: [],
};

describe("getBlogPostingJsonLd", () => {
  it("builds BlogPosting JSON-LD from real post fields only", () => {
    const jsonLd = getBlogPostingJsonLd(basePost);

    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.headline).toBe("Studio notes — July update");
    expect(jsonLd.url).toBe(
      "https://kamiyonstudio.com/blog/studio-notes-july-update",
    );
    expect(jsonLd.datePublished).toBe("2026-07-24T10:00:00.000Z");
    expect(jsonLd).not.toHaveProperty("dateModified");
    expect(jsonLd).not.toHaveProperty("image");
    expect(jsonLd.author).toEqual([{ "@type": "Person", name: "Founder" }]);
    expect(jsonLd.publisher).toMatchObject({
      "@type": "Organization",
      name: "Kamiyon Studio",
    });
  });

  it("includes CMS image and updatedAt when present", () => {
    const jsonLd = getBlogPostingJsonLd({
      ...basePost,
      updatedAt: "2026-07-25T12:00:00.000Z",
      featuredImage: {
        url: "https://media.kamiyonstudio.com/blog/cover.png",
        alt: "Cover",
      },
    });

    expect(jsonLd.dateModified).toBe("2026-07-25T12:00:00.000Z");
    expect(jsonLd.image).toEqual([
      "https://media.kamiyonstudio.com/blog/cover.png",
    ]);
  });
});
