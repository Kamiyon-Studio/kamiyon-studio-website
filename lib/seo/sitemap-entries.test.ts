import { describe, expect, it } from "vitest";

import { SERVICE_CATEGORIES } from "@/lib/cms/taxonomies";

import {
  buildPublicSitemapEntries,
  isSitemapIndexable,
  isSitemapServiceSlug,
} from "./sitemap-entries";

describe("isSitemapIndexable", () => {
  it("returns true when seo.noIndex is absent or false", () => {
    expect(isSitemapIndexable({})).toBe(true);
    expect(isSitemapIndexable({ seo: { noIndex: false } })).toBe(true);
  });

  it("returns false when seo.noIndex is true", () => {
    expect(isSitemapIndexable({ seo: { noIndex: true } })).toBe(false);
  });
});

describe("isSitemapServiceSlug", () => {
  it("accepts only the Gate 0 five service slugs", () => {
    for (const { value } of SERVICE_CATEGORIES) {
      expect(isSitemapServiceSlug(value)).toBe(true);
    }
    expect(isSitemapServiceSlug("mvp-development")).toBe(false);
    expect(isSitemapServiceSlug("ui-ux-design")).toBe(false);
    expect(isSitemapServiceSlug("game-dev")).toBe(false);
  });
});


describe("buildPublicSitemapEntries", () => {
  const siteUrl = "https://kamiyonstudio.com";

  it("returns an empty list for non-production hosts", () => {
    expect(
      buildPublicSitemapEntries({
        siteUrl: "http://localhost:3000",
        services: [],
        portfolioItems: [],
      })
    ).toEqual([]);
  });

  it("returns an empty list for preview even with production SITE_URL", () => {
    expect(
      buildPublicSitemapEntries({
        siteUrl: "https://kamiyonstudio.com",
        services: [{ slug: { current: "should-not-appear" }, seo: {} }],
        portfolioItems: [],
        appEnv: "preview",
      })
    ).toEqual([]);
  });

  it("returns an empty list for development APP_ENV with production SITE_URL", () => {
    expect(
      buildPublicSitemapEntries({
        siteUrl: "https://kamiyonstudio.com",
        services: [],
        portfolioItems: [],
        appEnv: "development",
      })
    ).toEqual([]);
  });

  it("includes six-page static routes and excludes products/community/motion-lab", () => {
    const entries = buildPublicSitemapEntries({
      siteUrl,
      services: [],
      portfolioItems: [],
      appEnv: "production",
    });
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        "https://kamiyonstudio.com",
        "https://kamiyonstudio.com/about",
        "https://kamiyonstudio.com/services",
        "https://kamiyonstudio.com/portfolio",
        "https://kamiyonstudio.com/contact",
        "https://kamiyonstudio.com/blog",
      ])
    );
    expect(urls).not.toContain("https://kamiyonstudio.com/products");
    expect(urls).not.toContain("https://kamiyonstudio.com/community");
    expect(urls).not.toContain("https://kamiyonstudio.com/motion-lab");
    expect(urls).not.toContain("https://kamiyonstudio.com/admin");
    expect(urls.every((url) => url.startsWith("https://kamiyonstudio.com"))).toBe(
      true
    );
  });

  it("includes entries when APP_ENV is unset and SITE_URL is canonical (local)", () => {
    const entries = buildPublicSitemapEntries({
      siteUrl,
      services: [],
      portfolioItems: [],
    });

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.map((entry) => entry.url)).toContain(
      "https://kamiyonstudio.com"
    );
  });

  it("includes only Gate 0 five service slugs and skips noIndex / orphan paths", () => {
    const entries = buildPublicSitemapEntries({
      siteUrl,
      services: [
        { slug: { current: "game-development" }, seo: {} },
        { slug: { current: "product-development" }, seo: {} },
        { slug: { current: "ui-design" }, seo: {} },
        { slug: { current: "branding" }, seo: {} },
        { slug: { current: "community-events" }, seo: {} },
        { slug: { current: "mvp-development" }, seo: {} },
        { slug: { current: "ui-ux-design" }, seo: {} },
        { slug: { current: "hidden-service" }, seo: { noIndex: true } },
      ],
      portfolioItems: [
        {
          slug: { current: "visible-case" },
          publishedAt: "2024-06-01T00:00:00.000Z",
          seo: { noIndex: false },
        },
      ],
      appEnv: "production",
    });
    const urls = entries.map((entry) => entry.url);
    const serviceUrls = urls.filter((url) =>
      url.startsWith("https://kamiyonstudio.com/services/")
    );

    expect(serviceUrls).toEqual([
      "https://kamiyonstudio.com/services/game-development",
      "https://kamiyonstudio.com/services/product-development",
      "https://kamiyonstudio.com/services/ui-design",
      "https://kamiyonstudio.com/services/branding",
      "https://kamiyonstudio.com/services/community-events",
    ]);
    expect(urls).toContain("https://kamiyonstudio.com/portfolio/visible-case");
    expect(urls).not.toContain(
      "https://kamiyonstudio.com/services/mvp-development"
    );
    expect(urls).not.toContain(
      "https://kamiyonstudio.com/services/ui-ux-design"
    );
    expect(urls).not.toContain(
      "https://kamiyonstudio.com/services/hidden-service"
    );
    expect(urls).not.toContain(
      "https://kamiyonstudio.com/products/visible-product"
    );

    const portfolioEntry = entries.find(
      (entry) => entry.url === "https://kamiyonstudio.com/portfolio/visible-case"
    );
    expect(portfolioEntry?.lastModified).toEqual(
      new Date("2024-06-01T00:00:00.000Z")
    );
  });

  it("omits lastModified when no CMS date is available", () => {
    const entries = buildPublicSitemapEntries({
      siteUrl,
      services: [{ slug: { current: "branding" }, seo: {} }],
      portfolioItems: [],
      appEnv: "production",
    });
    const serviceEntry = entries.find(
      (entry) => entry.url === "https://kamiyonstudio.com/services/branding"
    );

    expect(serviceEntry).toBeDefined();
    expect(serviceEntry).not.toHaveProperty("lastModified");
  });
});
