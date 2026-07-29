import { describe, expect, it } from "vitest";

import {
  mapAboutPage,
  mapCaseStudy,
  mapCollection,
  mapHomePage,
  mapPartner,
  mapPartnerToMarqueeItem,
  mapPost,
  mapService,
  mapSiteSettings,
} from "./mappers";

describe("mapSiteSettings", () => {
  it("returns null without a site name", () => {
    expect(mapSiteSettings({})).toBeNull();
  });

  it("maps core fields", () => {
    expect(
      mapSiteSettings({
        siteName: "Kamiyon Studio",
        tagline: "Create. Play. Inspire.",
        socialLinks: [{ platform: "email", url: "mailto:hi@example.com", label: "Email" }],
        defaultSeo: { title: "SEO", description: "Desc" },
        globalCtas: [{ label: "Contact", href: "/contact", variant: "primary" }],
      }),
    ).toMatchObject({
      _type: "siteSettings",
      siteName: "Kamiyon Studio",
      tagline: "Create. Play. Inspire.",
      socialLinks: [{ platform: "email", url: "mailto:hi@example.com", label: "Email" }],
      globalCtas: [{ label: "Contact", href: "/contact", variant: "primary" }],
    });
  });
});

describe("mapHomePage", () => {
  it("projects featured work refs into slug arrays", () => {
    const page = mapHomePage({
      title: "Home",
      blocks: [
        {
          _type: "featuredWork",
          title: "Featured",
          body: "Body",
          featuredProductSlugs: ["eclipse"],
          featuredCaseStudySlugs: ["case-a"],
        },
      ],
      seo: { title: "Home", description: "Desc" },
    });

    expect(page?.blocks[0]).toEqual({
      _type: "featuredWork",
      title: "Featured",
      body: "Body",
      featuredProductSlugs: ["eclipse"],
      featuredCaseStudySlugs: ["case-a"],
    });
  });
});

describe("mapAboutPage", () => {
  it("maps valid story timeline entries while preserving existing About fields", () => {
    const page = mapAboutPage({
      title: "About",
      storySections: [{ title: "Our story", body: "Story body" }],
      timelineHeading: "Our journey",
      timelineSummary: "How the studio grew.",
      timelineEntries: [
        {
          _key: "founded",
          year: "2024",
          dateLabel: "March 2024",
          date: "2024-03-01",
          title: "Studio founded",
          body: "Kamiyon Studio began.",
          image: {
            url: "https://media.kamiyonstudio.com/about/founded.jpg",
            alt: "The founding team",
          },
        },
        {
          year: "2025",
          dateLabel: "2025",
          title: "A new chapter",
          body: "The journey continued.",
        },
      ],
      mission: "Mission",
      vision: "Vision",
      motto: "Create. Play. Inspire.",
      values: [{ name: "Curiosity", description: "Keep learning." }],
      cultureSummary: "Culture",
      teamIntro: "Meet the team.",
      seo: { title: "About", description: "About Kamiyon Studio." },
    });

    expect(page).toMatchObject({
      _type: "aboutPage",
      title: "About",
      storySections: [{ title: "Our story", body: "Story body" }],
      timelineHeading: "Our journey",
      timelineSummary: "How the studio grew.",
      timelineEntries: [
        {
          key: "founded",
          entryType: "news",
          year: "2024",
          dateLabel: "March 2024",
          date: "2024-03-01",
          title: "Studio founded",
          body: "Kamiyon Studio began.",
          images: [
            {
              url: "https://media.kamiyonstudio.com/about/founded.jpg",
              alt: "The founding team",
            },
          ],
        },
      ],
      mission: "Mission",
      vision: "Vision",
      motto: "Create. Play. Inspire.",
      values: [{ name: "Curiosity", description: "Keep learning." }],
      cultureSummary: "Culture",
      teamIntro: "Meet the team.",
    });
  });

  it("skips timeline entries missing required strings", () => {
    const page = mapAboutPage({
      title: "About",
      mission: "Mission",
      timelineEntries: [
        {
          _key: "valid",
          year: "2024",
          dateLabel: "March 2024",
          title: "Studio founded",
          body: "Kamiyon Studio began.",
          images: [
            {
              url: "https://media.kamiyonstudio.com/about/founded.jpg",
              alt: "Founding",
            },
          ],
        },
        {
          _key: "missing-title",
          year: "2025",
          dateLabel: "2025",
          title: " ",
          body: "Incomplete.",
          images: [
            {
              url: "https://media.kamiyonstudio.com/about/other.jpg",
              alt: "Other",
            },
          ],
        },
      ],
    });

    expect(page?.timelineEntries).toMatchObject([
      {
        key: "valid",
        entryType: "news",
        year: "2024",
        dateLabel: "March 2024",
        title: "Studio founded",
        body: "Kamiyon Studio began.",
        images: [
          {
            url: "https://media.kamiyonstudio.com/about/founded.jpg",
            alt: "Founding",
          },
        ],
      },
    ]);
  });

  it("defaults entryType to news and maps teamJoin with resolved member", () => {
    const page = mapAboutPage({
      title: "About",
      mission: "Mission",
      timelineEntries: [
        {
          _key: "news-1",
          year: "2024",
          dateLabel: "March 2024",
          title: "Studio founded",
          body: "Kamiyon Studio began.",
          images: [
            {
              url: "https://media.kamiyonstudio.com/about/a.jpg",
              alt: "A",
            },
          ],
        },
        {
          _key: "join-1",
          entryType: "teamJoin",
          year: "2025",
          dateLabel: "June 2025",
          title: "Alice joins the team",
          body: "Welcome Alice.",
          images: [
            {
              url: "https://media.kamiyonstudio.com/about/b.jpg",
              alt: "B",
            },
            {
              url: "https://media.kamiyonstudio.com/about/c.jpg",
              alt: "C",
            },
          ],
          teamMember: {
            _id: "teamMember.alice",
            name: "Alice Example",
            role: "Designer",
            photo: {
              url: "https://media.kamiyonstudio.com/team/alice.jpg",
              alt: "Alice",
            },
          },
        },
      ],
    });

    expect(page?.timelineEntries).toMatchObject([
      {
        key: "news-1",
        entryType: "news",
        year: "2024",
        dateLabel: "March 2024",
        title: "Studio founded",
        body: "Kamiyon Studio began.",
        images: [
          {
            url: "https://media.kamiyonstudio.com/about/a.jpg",
            alt: "A",
          },
        ],
      },
      {
        key: "join-1",
        entryType: "teamJoin",
        year: "2025",
        dateLabel: "June 2025",
        title: "Alice joins the team",
        body: "Welcome Alice.",
        images: [
          {
            url: "https://media.kamiyonstudio.com/about/b.jpg",
            alt: "B",
          },
          {
            url: "https://media.kamiyonstudio.com/about/c.jpg",
            alt: "C",
          },
        ],
        teamMember: {
          id: "teamMember.alice",
          name: "Alice Example",
          role: "Designer",
          photo: {
            url: "https://media.kamiyonstudio.com/team/alice.jpg",
            alt: "Alice",
          },
        },
      },
    ]);
  });

  it("drops teamJoin without a resolvable member and entries with no images", () => {
    const page = mapAboutPage({
      title: "About",
      mission: "Mission",
      timelineEntries: [
        {
          _key: "orphan-join",
          entryType: "teamJoin",
          year: "2025",
          dateLabel: "2025",
          title: "Someone joins",
          body: "Missing person.",
          images: [
            {
              url: "https://media.kamiyonstudio.com/about/x.jpg",
              alt: "X",
            },
          ],
        },
        {
          _key: "no-images",
          year: "2024",
          dateLabel: "2024",
          title: "No media",
          body: "Dropped.",
        },
        {
          _key: "slug-fallback",
          entryType: "teamJoin",
          year: "2026",
          dateLabel: "2026",
          title: "Bob joins",
          body: "Welcome Bob.",
          images: [
            {
              url: "https://media.kamiyonstudio.com/about/y.jpg",
              alt: "Y",
            },
          ],
          teamMember: {
            name: "Bob Example",
          },
        },
      ],
    });

    expect(page?.timelineEntries).toMatchObject([
      {
        key: "slug-fallback",
        entryType: "teamJoin",
        year: "2026",
        dateLabel: "2026",
        title: "Bob joins",
        body: "Welcome Bob.",
        images: [
          {
            url: "https://media.kamiyonstudio.com/about/y.jpg",
            alt: "Y",
          },
        ],
        teamMember: {
          id: "bob-example",
          name: "Bob Example",
          role: "",
        },
      },
    ]);
  });
});

describe("mapService", () => {
  it("maps tagline and capabilities from Gate 0 shape", () => {
    expect(
      mapService({
        title: "Game Development",
        slug: { current: "game-development" },
        tagline: "Build games.",
        summary: "Summary",
        body: [],
        capabilities: ["Prototyping"],
        order: 1,
        isPlaceholder: true,
        seo: { title: "Game Development", description: "Desc" },
      }),
    ).toMatchObject({
      _type: "service",
      title: "Game Development",
      slug: { current: "game-development" },
      tagline: "Build games.",
      capabilities: ["Prototyping"],
    });
  });

  it("ignores legacy outcomes/category fields and never maps them", () => {
    const mapped = mapService({
      title: "Branding",
      slug: { current: "branding" },
      tagline: "Build memorable brands with purpose.",
      summary: "Summary",
      body: [],
      capabilities: ["Brand identity"],
      outcomes: ["Legacy outcome"],
      categorySlug: "creative-design-services",
      category: { title: "Creative" },
      relatedIndustries: ["education"],
      order: 4,
      isPlaceholder: true,
      seo: { title: "Branding", description: "Desc" },
    });

    expect(mapped).toMatchObject({
      tagline: "Build memorable brands with purpose.",
      capabilities: ["Brand identity"],
    });
    expect(mapped).not.toHaveProperty("outcomes");
    expect(mapped).not.toHaveProperty("category");
    expect(mapped).not.toHaveProperty("categorySlug");
    expect(mapped).not.toHaveProperty("relatedIndustries");
  });

  it("returns null for non-canonical service slugs", () => {
    expect(
      mapService({
        title: "MVP Development",
        slug: { current: "mvp-development" },
        tagline: "Legacy",
        summary: "Summary",
        capabilities: ["MVP"],
        order: 1,
        isPlaceholder: true,
        seo: { title: "MVP", description: "Desc" },
      }),
    ).toBeNull();
  });
});

describe("mapPortfolio", () => {
  it("maps r2 cover and gallery assets", () => {
    const study = mapCaseStudy({
      title: "Case",
      slug: { current: "case" },
      clientName: "Client",
      industry: "Edu",
      serviceType: "game-development",
      challenge: "C",
      solution: "S",
      impact: "I",
      coverImage: { url: "https://cdn.example.com/cover.png", alt: "Cover" },
      gallery: [{ url: "https://cdn.example.com/g1.png", alt: "G1", _key: "g1" }],
      featured: true,
      isPlaceholder: false,
      seo: { title: "Case", description: "Desc" },
    });

    expect(study?._type).toBe("portfolio");
    expect(study?.coverImage?.url).toBe("https://cdn.example.com/cover.png");
    expect(study?.gallery).toHaveLength(1);
    expect(study?.gallery[0]?.url).toBe("https://cdn.example.com/g1.png");
  });
});

describe("mapPost", () => {
  it("requires publishedAt", () => {
    expect(mapPost({ title: "Draft", slug: { current: "draft" } })).toBeNull();
  });

  it("maps teamMember authors, string taxonomies, and inline images", () => {
    const post = mapPost({
      title: "Hello",
      slug: { current: "hello" },
      publishedAt: "2026-07-21T00:00:00.000Z",
      authors: [
        {
          name: "Ada",
          role: "CEO",
          bio: "Bio",
          order: 1,
          isPlaceholder: false,
          socialLinks: [],
        },
      ],
      categories: ["updates"],
      tags: ["coming-soon", "announcement"],
      body: [
        { _type: "block", children: [{ _type: "span", text: "Hi" }] },
        {
          _type: "inlineImage",
          _key: "img1",
          asset: { url: "https://cdn.example.com/inline.png", alt: "Inline" },
        },
      ],
      seo: { title: "Hello", description: "Desc" },
      relatedPostSlugs: ["other"],
    });

    expect(post).toMatchObject({
      _type: "post",
      authors: [{ _type: "teamMember", name: "Ada", role: "CEO" }],
      categories: [{ title: "Updates", slug: { current: "updates" } }],
      tags: [
        { title: "Coming soon", slug: { current: "coming-soon" } },
        { title: "Announcement", slug: { current: "announcement" } },
      ],
      relatedPostSlugs: ["other"],
      body: [
        { _type: "block" },
        {
          _type: "inlineImage",
          asset: { url: "https://cdn.example.com/inline.png", alt: "Inline" },
        },
      ],
    });
  });
});

describe("mapPartner", () => {
  it("returns null without a label", () => {
    expect(mapPartner({ slug: { current: "acme" }, _id: "partner-1" })).toBeNull();
  });

  it("prefers slug.current as id", () => {
    expect(
      mapPartner({
        _id: "drafts.partner-1",
        label: "Partner placeholder",
        slug: { current: "partner-1" },
        order: 1,
        isPlaceholder: true,
      }),
    ).toMatchObject({
      _type: "partner",
      id: "partner-1",
      label: "Partner placeholder",
      slug: { current: "partner-1" },
      order: 1,
      isPlaceholder: true,
    });
  });

  it("falls back to document _id when slug is missing", () => {
    expect(
      mapPartner({
        _id: "partner-doc-2",
        label: "Partner placeholder",
        order: 2,
      }),
    ).toMatchObject({
      id: "partner-doc-2",
      label: "Partner placeholder",
    });
  });

  it("maps optional logo without website links", () => {
    expect(
      mapPartner({
        _id: "p3",
        label: "Partner placeholder",
        slug: { current: "partner-3" },
        order: 3,
        logo: { url: "https://media.kamiyonstudio.com/partners/logo.png", alt: "Logo" },
        websiteUrl: "https://example.com",
        isPlaceholder: false,
      }),
    ).toMatchObject({
      logo: { url: "https://media.kamiyonstudio.com/partners/logo.png", alt: "Logo" },
      isPlaceholder: false,
    });
    expect(
      mapPartner({
        _id: "p3",
        label: "Partner placeholder",
        slug: { current: "partner-3" },
        order: 3,
        websiteUrl: "https://example.com",
      }),
    ).not.toHaveProperty("websiteUrl");
  });
});

describe("mapPartnerToMarqueeItem", () => {
  it("projects to id/label for PartnersMarquee", () => {
    expect(
      mapPartnerToMarqueeItem({
        _type: "partner",
        id: "partner-1",
        label: "Partner placeholder",
        slug: { current: "partner-1" },
        order: 1,
        isPlaceholder: true,
      }),
    ).toEqual({
      id: "partner-1",
      label: "Partner placeholder",
      logoUrl: null,
      logoAlt: "Partner placeholder",
    });
  });

  it("projects allowlisted logo URL for marquee image slots", () => {
    expect(
      mapPartnerToMarqueeItem({
        _type: "partner",
        id: "acme",
        label: "Acme",
        slug: { current: "acme" },
        order: 1,
        logo: {
          url: "https://media.kamiyonstudio.com/partners/acme.png",
          alt: "Acme logo",
        },
        isPlaceholder: false,
      }),
    ).toEqual({
      id: "acme",
      label: "Acme",
      logoUrl: "https://media.kamiyonstudio.com/partners/acme.png",
      logoAlt: "Acme logo",
    });
  });
});

describe("mapCollection", () => {
  it("returns null for empty arrays", () => {
    expect(mapCollection([], (row) => row)).toBeNull();
  });

  it("maps non-empty collections", () => {
    expect(mapCollection([{ id: 1 }], (row) => row as { id: number })).toEqual([{ id: 1 }]);
  });
});
