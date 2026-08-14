import { describe, expect, it } from "vitest";

import {
  mapAboutPage,
  mapAward,
  mapCaseStudy,
  mapCollection,
  mapHomePage,
  mapPartner,
  mapPartnerToMarqueeItem,
  mapPortfolio,
  mapPost,
  mapService,
  mapSiteSettings,
  mapTestimonial,
  mapTestimonialToMarqueeItem,
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

  it("maps footer* fields when present", () => {
    expect(
      mapSiteSettings({
        siteName: "Kamiyon Studio",
        tagline: "Tag",
        defaultSeo: { title: "SEO", description: "Desc" },
        footerMarqueeKeywords: ["Games", "EdTech"],
        footerCtaHeading: "Ready to begin?",
        footerSecondaryCtaLabel: "View portfolio",
        footerSecondaryCtaHref: "/portfolio",
        footerCopyrightSuffix: "All rights reserved.",
        footerLocationPrefix: "Based in ",
        footerLocation: "Biñan City, Laguna, Philippines",
      }),
    ).toMatchObject({
      footerMarqueeKeywords: ["Games", "EdTech"],
      footerCtaHeading: "Ready to begin?",
      footerSecondaryCtaLabel: "View portfolio",
      footerSecondaryCtaHref: "/portfolio",
      footerCopyrightSuffix: "All rights reserved.",
      footerLocationPrefix: "Based in ",
      footerLocation: "Biñan City, Laguna, Philippines",
    });
  });
});

describe("mapHomePage", () => {
  it("returns null without title or seo", () => {
    expect(mapHomePage({ title: "Home" })).toBeNull();
    expect(mapHomePage({ seo: { title: "Home", description: "Desc" } })).toBeNull();
  });

  it("maps named fields and keeps empty ref arrays empty", () => {
    const page = mapHomePage({
      title: "Home",
      partners: [],
      portfolioItems: [],
      awards: [],
      services: [],
      contactCta: {
        title: "Let’s build",
        body: "Body",
        ctaLabel: "Contact",
        ctaHref: "/contact",
      },
      seo: { title: "Home", description: "Desc" },
    });

    expect(page).toMatchObject({
      _type: "homePage",
      title: "Home",
      partners: [],
      portfolioItems: [],
      awards: [],
      testimonials: [],
      services: [],
      contactCta: {
        title: "Let’s build",
        body: "Body",
        ctaLabel: "Contact",
        ctaHref: "/contact",
      },
      seo: { title: "Home", description: "Desc", noIndex: false },
    });
  });

  it("keeps testimonials empty when missing or empty", () => {
    const missing = mapHomePage({
      title: "Home",
      seo: { title: "Home", description: "Desc" },
    });
    expect(missing?.testimonials).toEqual([]);

    const empty = mapHomePage({
      title: "Home",
      testimonials: [],
      seo: { title: "Home", description: "Desc" },
    });
    expect(empty?.testimonials).toEqual([]);
  });

  it("resolves partner/award refs without substituting full collections", () => {
    const page = mapHomePage({
      title: "Home",
      partners: [
        {
          _id: "partner-1",
          label: "Acme",
          slug: { current: "acme" },
          order: 1,
          isPlaceholder: false,
        },
      ],
      awards: [
        {
          _id: "award-1",
          title: "Design Award",
          order: 1,
          isPlaceholder: true,
          placeholderLabel: "Coming soon",
        },
      ],
      seo: { title: "Home", description: "Desc" },
    });

    expect(page?.partners).toHaveLength(1);
    expect(page?.partners[0]).toMatchObject({ id: "acme", label: "Acme" });
    expect(page?.awards).toHaveLength(1);
    expect(page?.awards[0]).toMatchObject({
      id: "award-1",
      placeholderLabel: "Coming soon",
      isPlaceholder: true,
    });
    expect(page?.portfolioItems).toEqual([]);
    expect(page?.services).toEqual([]);
    expect(page?.testimonials).toEqual([]);
  });

  it("resolves testimonial refs without substituting a collection", () => {
    const page = mapHomePage({
      title: "Home",
      testimonials: [
        {
          _id: "testimonial-1",
          quote: "Fixture quote for tests.",
          name: "Fixture Author",
          order: 1,
        },
      ],
      seo: { title: "Home", description: "Desc" },
    });

    expect(page?.testimonials).toHaveLength(1);
    expect(page?.testimonials[0]).toMatchObject({
      id: "testimonial-1",
      quote: "Fixture quote for tests.",
      name: "Fixture Author",
    });
    expect(page?.partners).toEqual([]);
    expect(page?.awards).toEqual([]);
    expect(page?.services).toEqual([]);
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
    expect(mapped).not.toHaveProperty("icon");
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

  it("defaults missing optional groups for legacy client-work documents", () => {
    const study = mapPortfolio({
      title: "Legacy",
      slug: { current: "legacy" },
      clientName: "Acme",
      industry: "Brand",
      serviceType: "branding",
      challenge: "A branding challenge.",
      solution: "A branding solution.",
      impact: "A branding impact.",
      featured: false,
      isPlaceholder: true,
      seo: { title: "Legacy", description: "Desc" },
    });

    expect(study).toMatchObject({
      projectType: "client-work",
      shortDescription: "A branding challenge.",
      credits: [],
      recognition: [],
      videos: [],
      externalLinks: [],
    });
    expect(study?.gameplay).toBeUndefined();
    expect(study?.technicalDevelopment).toBeUndefined();
    expect(study?.narrative).toBeUndefined();
    expect(study?.status).toBeUndefined();
  });

  it("maps Eclipse-depth groups including credit person refs and recognition", () => {
    const study = mapPortfolio({
      title: "Eclipse",
      slug: { current: "eclipse" },
      projectType: "original-ip",
      clientName: "Kamiyon Studio",
      industry: "Games / Interactive Entertainment",
      serviceType: "game-development",
      status: "in-development",
      developmentPeriod: "Global Game Jam 2026 → Present",
      shortDescription: "A dual-state movement-platformer.",
      positioning: "Changing realities changes the rules of physics.",
      challenge: "Jam timebox.",
      solution: "Visage is the interaction model.",
      impact: "Playable original IP.",
      narrative: [{ _type: "block", children: [{ _type: "span", text: "The Veiled." }] }],
      technicalDevelopment: {
        platforms: "PC",
        input: "Keyboard + Mouse",
        origin: "Global Game Jam 2026",
        systems: ["Dual-state world", "Visage switch"],
      },
      gameplay: {
        mechanics: [{ _type: "block", children: [{ _type: "span", text: "State is the model." }] }],
        dualStateTable: {
          leftLabel: "Fragment",
          rightLabel: "Resonance",
          rows: [{ _key: "r1", aspect: "Combat", left: "Melee", right: "Sonic pulses" }],
        },
        controls: [{ _key: "c1", input: "Right Click", action: "Toggle Visage" }],
      },
      credits: [
        { _key: "sh", name: "Sherwin Limosnero", role: "Sound Designer", person: { _id: "teamMember-sherwin-limosnero", name: "Sherwin Limosnero" } },
      ],
      recognition: [
        {
          title: "Most Fun Award",
          organization: "CIIT College of Innovation and Integrated Technology",
          year: "2026",
          note: "Global Game Jam 2026 entry",
        },
      ],
      featured: true,
      isPlaceholder: false,
      seo: { title: "Eclipse", description: "Desc" },
    });

    expect(study?.projectType).toBe("original-ip");
    expect(study?.technicalDevelopment?.engine).toBeUndefined();
    expect(study?.gameplay?.dualStateTable?.leftLabel).toBe("Fragment");
    expect(study?.credits[0]).toMatchObject({
      role: "Sound Designer",
      person: { id: "teamMember-sherwin-limosnero", name: "Sherwin Limosnero" },
    });
    expect(study?.recognition[0]?.title).toBe("Most Fun Award");
    expect(study?.narrative?.[0]?.children[0]?.text).toBe("The Veiled.");
  });

  it("maps videos, links, and drops empty optional groups", () => {
    const study = mapPortfolio({
      title: "Linked",
      slug: { current: "linked" },
      projectType: "not-a-type",
      status: "shipping",
      clientName: "Studio",
      industry: "Games",
      serviceType: "game-development",
      challenge: "C",
      solution: "S",
      impact: "I",
      creativeDirection: [{ _type: "block", children: [{ _type: "span", text: "   " }] }],
      technicalDevelopment: { engine: "  ", platforms: "", systems: [] },
      gameplay: { mechanics: [], controls: [] },
      credits: [{ name: "  ", role: "  " }, { name: "Ada", role: "Lead", person: { id: "teamMember-ada", name: "Ada" } }],
      recognition: [{ title: "  " }, { title: "Jury prize", organization: "Org", year: "2026", url: "https://example.com" }],
      videos: [{ url: "https://example.com/watch", title: "Watch" }, { url: "" }, { url: "javascript:alert(1)" }],
      externalLinks: [
        { label: "Site", url: "https://example.com", kind: "website" },
        { label: "Odd", url: "https://example.com/x", kind: "mystery" },
        { label: "", url: "https://example.com/skip" },
        { label: "Bad", url: "javascript:alert(1)", kind: "website" },
      ],
      seo: { title: "Linked", description: "Desc" },
    });

    expect(study?.projectType).toBe("client-work");
    expect(study?.status).toBeUndefined();
    expect(study?.creativeDirection).toBeUndefined();
    expect(study?.technicalDevelopment).toBeUndefined();
    expect(study?.gameplay).toBeUndefined();
    expect(study?.credits).toEqual([
      expect.objectContaining({
        name: "Ada",
        person: { id: "teamMember-ada", name: "Ada" },
      }),
    ]);
    expect(study?.recognition).toEqual([
      expect.objectContaining({ title: "Jury prize", url: "https://example.com" }),
    ]);
    expect(study?.videos).toEqual([
      expect.objectContaining({ url: "https://example.com/watch", title: "Watch" }),
    ]);
    expect(study?.externalLinks).toEqual([
      expect.objectContaining({ kind: "website" }),
      expect.objectContaining({ kind: "other" }),
    ]);
  });
});

describe("mapPost", () => {
  it("requires publishedAt", () => {
    expect(mapPost({ title: "Draft", slug: { current: "draft" } })).toBeNull();
  });

  it("maps teamMember authors and inline images without taxonomy fields", () => {
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
      tags: ["coming-soon"],
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
      readingTimeMinutes: 3,
    });

    expect(post).toMatchObject({
      _type: "post",
      authors: [{ _type: "teamMember", name: "Ada", role: "CEO" }],
      body: [
        { _type: "block" },
        {
          _type: "inlineImage",
          asset: { url: "https://cdn.example.com/inline.png", alt: "Inline" },
        },
      ],
    });
    expect(post).not.toHaveProperty("categories");
    expect(post).not.toHaveProperty("tags");
    expect(post).not.toHaveProperty("readingTimeMinutes");
    expect(post).not.toHaveProperty("relatedPostSlugs");
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

describe("mapAward", () => {
  it("returns null without a title", () => {
    expect(mapAward({ _id: "award-1", label: "Winner", order: 1 })).toBeNull();
    expect(mapAward({ _id: "award-1", title: "   ", order: 1 })).toBeNull();
    expect(mapAward(null)).toBeNull();
  });

  it("maps the full award shape including placeholderLabel", () => {
    expect(
      mapAward({
        _id: "award-slot-1",
        title: "Gameplay Design Award",
        label: "Winner",
        organization: "Montreal Independent Games Festival",
        year: "2026",
        order: 2,
        isPlaceholder: false,
        placeholderLabel: "Placeholder",
      }),
    ).toEqual({
      _type: "award",
      id: "award-slot-1",
      title: "Gameplay Design Award",
      label: "Winner",
      organization: "Montreal Independent Games Festival",
      year: "2026",
      order: 2,
      isPlaceholder: false,
      placeholderLabel: "Placeholder",
    });
  });

  it("defaults placeholderLabel when isPlaceholder and field is missing", () => {
    expect(
      mapAward({
        _id: "award-slot-2",
        title: "Award slot",
        order: 1,
        isPlaceholder: true,
      }),
    ).toMatchObject({
      isPlaceholder: true,
      placeholderLabel: "Placeholder",
    });
  });

  it("omits blank optional fields rather than emitting empty strings", () => {
    const award = mapAward({
      _id: "award-slot-2",
      title: "Award slot",
      label: "  ",
      organization: "",
    });

    expect(award).not.toHaveProperty("label");
    expect(award).not.toHaveProperty("organization");
    expect(award).not.toHaveProperty("year");
    expect(award).toMatchObject({ order: 0, isPlaceholder: false });
  });

  it("derives a stable id from the title when _id is missing", () => {
    expect(mapAward({ title: "Best Student Game 2026" })).toMatchObject({
      id: "best-student-game-2026",
    });
  });
});

describe("mapTestimonial", () => {
  it("returns null without quote or name", () => {
    expect(mapTestimonial({ name: "Fixture Author" })).toBeNull();
    expect(mapTestimonial({ quote: "Fixture quote for tests." })).toBeNull();
    expect(mapTestimonial({ quote: "   ", name: "Fixture Author" })).toBeNull();
    expect(mapTestimonial({ quote: "Fixture quote for tests.", name: "   " })).toBeNull();
    expect(mapTestimonial(null)).toBeNull();
  });

  it("maps the full shape with photo", () => {
    expect(
      mapTestimonial({
        _id: "testimonial-1",
        quote: "Fixture quote for tests.",
        name: "Fixture Author",
        role: "Creative Director",
        photo: {
          url: "https://media.kamiyonstudio.com/testimonials/author.png",
          alt: "Fixture Author",
        },
        order: 2,
      }),
    ).toEqual({
      _type: "testimonial",
      id: "testimonial-1",
      quote: "Fixture quote for tests.",
      name: "Fixture Author",
      role: "Creative Director",
      photo: {
        url: "https://media.kamiyonstudio.com/testimonials/author.png",
        alt: "Fixture Author",
        caption: null,
      },
      order: 2,
    });
  });

  it("omits blank role and missing photo", () => {
    const mapped = mapTestimonial({
      _id: "testimonial-2",
      quote: "Fixture quote for tests.",
      name: "Fixture Author",
      role: "  ",
    });

    expect(mapped).not.toHaveProperty("role");
    expect(mapped).not.toHaveProperty("photo");
    expect(mapped).toMatchObject({
      _type: "testimonial",
      id: "testimonial-2",
      quote: "Fixture quote for tests.",
      name: "Fixture Author",
      order: 0,
    });
  });

  it("derives a stable id from the name when _id is missing", () => {
    expect(
      mapTestimonial({
        quote: "Fixture quote for tests.",
        name: "Fixture Author",
      }),
    ).toMatchObject({
      id: "fixture-author",
    });
  });
});

describe("mapTestimonialToMarqueeItem", () => {
  it("maps photo via allowlisted URL and includes role when present", () => {
    expect(
      mapTestimonialToMarqueeItem({
        _type: "testimonial",
        id: "testimonial-1",
        quote: "Fixture quote for tests.",
        name: "Fixture Author",
        role: "Creative Director",
        photo: {
          url: "https://media.kamiyonstudio.com/testimonials/author.png",
          alt: "Portrait",
        },
        order: 1,
      }),
    ).toEqual({
      id: "testimonial-1",
      quote: "Fixture quote for tests.",
      name: "Fixture Author",
      role: "Creative Director",
      photoUrl: "https://media.kamiyonstudio.com/testimonials/author.png",
      photoAlt: "Portrait",
    });
  });

  it("returns null photoUrl when photo is missing and omits role when absent", () => {
    expect(
      mapTestimonialToMarqueeItem({
        _type: "testimonial",
        id: "testimonial-1",
        quote: "Fixture quote for tests.",
        name: "Fixture Author",
        order: 1,
      }),
    ).toEqual({
      id: "testimonial-1",
      quote: "Fixture quote for tests.",
      name: "Fixture Author",
      photoUrl: null,
      photoAlt: "Fixture Author",
    });
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
