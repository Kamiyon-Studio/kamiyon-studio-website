import { afterEach, describe, expect, it, vi } from "vitest";

import { aboutPageQuery, serviceBySlugQuery, servicesQuery } from "./groq";
import { SERVICE_CATEGORIES } from "./taxonomies";

const safeFetchMock = vi.fn();

vi.mock("./fetch", () => ({
  safeSanityFetch: (...args: unknown[]) => safeFetchMock(...args),
}));

const CANONICAL_SERVICE_SLUGS = SERVICE_CATEGORIES.map((c) => c.value);
const CANONICAL_SERVICE_SLUGS_GROQ = JSON.stringify(CANONICAL_SERVICE_SLUGS);

describe("service GROQ (Gate 0 five-service taxonomy)", () => {
  it("servicesQuery returns only the five canonical slugs ordered by order", () => {
    expect(CANONICAL_SERVICE_SLUGS).toHaveLength(5);
    expect(servicesQuery).toContain(
      `slug.current in ${CANONICAL_SERVICE_SLUGS_GROQ}`,
    );
    expect(servicesQuery).toContain("| order(order asc)");
    expect(servicesQuery).toContain("tagline");
    expect(servicesQuery).toContain("capabilities");
    expect(servicesQuery).not.toContain("outcomes");
    expect(servicesQuery).not.toContain("categorySlug");
    expect(servicesQuery).not.toMatch(/\bcategory\b/);
  });

  it("serviceBySlugQuery scopes to canonical slugs and Gate 0 fields", () => {
    expect(serviceBySlugQuery).toContain('slug.current == $slug');
    expect(serviceBySlugQuery).toContain(
      `slug.current in ${CANONICAL_SERVICE_SLUGS_GROQ}`,
    );
    expect(serviceBySlugQuery).toContain("tagline");
    expect(serviceBySlugQuery).toContain("capabilities");
    expect(serviceBySlugQuery).not.toContain("outcomes");
  });
});

describe("About Story Timeline GROQ", () => {
  it("projects timeline copy, keyed entries, and R2 image fields", () => {
    expect(aboutPageQuery).toContain("timelineHeading");
    expect(aboutPageQuery).toContain("timelineSummary");
    expect(aboutPageQuery).toContain("timelineEntries[]");
    expect(aboutPageQuery).toMatch(
      /timelineEntries\[\]\s*\{\s*_key,\s*year,\s*dateLabel,\s*date,\s*title,\s*body,/,
    );
    expect(aboutPageQuery).toMatch(
      /image\s*\{\s*url,\s*key,\s*alt,\s*caption,\s*_key\s*\}/,
    );
  });
});

describe("CMS query functions (Sanity + fallbacks)", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns null for every getter when Sanity yields nothing", async () => {
    safeFetchMock.mockResolvedValue(null);
    const queries = await import("./queries");

    await expect(queries.getSiteSettings()).resolves.toBeNull();
    await expect(queries.getHomePage()).resolves.toBeNull();
    await expect(queries.getAboutPage()).resolves.toBeNull();
    await expect(queries.getTeamMembers()).resolves.toBeNull();
    await expect(queries.getServices()).resolves.toBeNull();
    await expect(queries.getServiceBySlug("x")).resolves.toBeNull();
    await expect(queries.getProducts()).resolves.toBeNull();
    await expect(queries.getProductBySlug("x")).resolves.toBeNull();
    await expect(queries.getPortfolioItems()).resolves.toBeNull();
    await expect(queries.getPortfolioItemBySlug("x")).resolves.toBeNull();
    await expect(queries.getCommunityItems()).resolves.toBeNull();
    await expect(queries.getPartners()).resolves.toBeNull();
    await expect(queries.getContactPage()).resolves.toBeNull();
    await expect(queries.getPosts()).resolves.toBeNull();
    await expect(queries.getPostBySlug("x")).resolves.toBeNull();
    expect(queries).not.toHaveProperty("getServiceCategories");
  });

  it("maps configured Sanity documents through getters", async () => {
    safeFetchMock.mockImplementation(async (query: string) => {
      if (query.includes('_type == "siteSettings"')) {
        return {
          siteName: "Kamiyon Studio",
          tagline: "Create. Play. Inspire.",
          socialLinks: [],
          defaultSeo: { title: "Kamiyon", description: "Studio" },
          globalCtas: [],
        };
      }
      if (query.includes('_type == "service" && slug.current')) {
        return {
          title: "Game Development",
          slug: { current: "game-development" },
          tagline: "Build immersive games.",
          summary: "Summary",
          body: [],
          capabilities: ["Full-cycle game development"],
          order: 1,
          isPlaceholder: true,
          seo: { title: "Game Development", description: "Summary" },
        };
      }
      if (query.includes('_type == "teamMember"')) {
        return [{ name: "Ada", role: "Founder", bio: "Bio", order: 1, isPlaceholder: false }];
      }
      if (query.includes('_type == "partner"')) {
        return [
          {
            _id: "partner-1",
            label: "Partner placeholder",
            slug: { current: "partner-1" },
            order: 1,
            isPlaceholder: true,
          },
        ];
      }
      return null;
    });

    const queries = await import("./queries");

    await expect(queries.getSiteSettings()).resolves.toMatchObject({
      siteName: "Kamiyon Studio",
    });
    await expect(queries.getServiceBySlug("game-development")).resolves.toMatchObject({
      slug: { current: "game-development" },
      tagline: "Build immersive games.",
      capabilities: ["Full-cycle game development"],
    });
    await expect(queries.getTeamMembers()).resolves.toEqual([
      expect.objectContaining({ name: "Ada", role: "Founder", socialLinks: [] }),
    ]);
    await expect(queries.getPartners()).resolves.toEqual([
      expect.objectContaining({
        id: "partner-1",
        label: "Partner placeholder",
        slug: { current: "partner-1" },
      }),
    ]);
  });

  it("getServices returns only the five Gate 0 services in fixed order", async () => {
    safeFetchMock.mockResolvedValue([
      {
        title: "Branding",
        slug: { current: "branding" },
        tagline: "Build memorable brands with purpose.",
        summary: "S",
        body: [],
        capabilities: ["Brand identity"],
        order: 4,
        isPlaceholder: true,
        seo: { title: "Branding", description: "D" },
      },
      {
        title: "Game Development",
        slug: { current: "game-development" },
        tagline: "Build immersive games that inspire, educate, and entertain.",
        summary: "S",
        body: [],
        capabilities: ["Full-cycle game development"],
        order: 1,
        isPlaceholder: true,
        seo: { title: "Game Development", description: "D" },
      },
      {
        title: "MVP Development",
        slug: { current: "mvp-development" },
        tagline: "Legacy",
        summary: "S",
        body: [],
        capabilities: ["MVP"],
        order: 2,
        isPlaceholder: true,
        seo: { title: "MVP", description: "D" },
      },
      {
        title: "UI & Design",
        slug: { current: "ui-design" },
        tagline: "Design experiences people love to use.",
        summary: "S",
        body: [],
        capabilities: ["UI/UX design"],
        order: 3,
        isPlaceholder: true,
        seo: { title: "UI & Design", description: "D" },
      },
      {
        title: "Product Development",
        slug: { current: "product-development" },
        tagline: "Transform ideas into modern digital products.",
        summary: "S",
        body: [],
        capabilities: ["MVP development"],
        order: 2,
        isPlaceholder: true,
        seo: { title: "Product Development", description: "D" },
      },
      {
        title: "Community & Events",
        slug: { current: "community-events" },
        tagline: "Grow communities through meaningful experiences.",
        summary: "S",
        body: [],
        capabilities: ["Community building"],
        order: 5,
        isPlaceholder: true,
        seo: { title: "Community & Events", description: "D" },
      },
    ]);

    const queries = await import("./queries");
    const services = await queries.getServices();

    expect(services?.map((s) => s.slug.current)).toEqual([...CANONICAL_SERVICE_SLUGS]);
    expect(services).toHaveLength(5);
  });

  it("getServiceBySlug skips fetch for non-canonical slugs", async () => {
    const queries = await import("./queries");
    await expect(queries.getServiceBySlug("mvp-development")).resolves.toBeNull();
    expect(safeFetchMock).not.toHaveBeenCalled();
  });
});
