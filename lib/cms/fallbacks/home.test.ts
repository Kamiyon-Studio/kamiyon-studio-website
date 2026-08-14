/**
 * RFC — Sanity ↔ Frontend Align §1.1 / §4 homePageFallback shape
 */
import { describe, expect, it } from "vitest";

import { homePageFallback } from "./home";

describe("homePageFallback (RFC named fields)", () => {
  it("uses contactCta object and empty list fields (no blocks)", () => {
    expect(homePageFallback).not.toHaveProperty("blocks");
    expect(homePageFallback).toMatchObject({
      _type: "homePage",
      title: "Home",
      partners: [],
      portfolioItems: [],
      awards: [],
      services: [],
      contactCta: {
        title: expect.any(String),
        body: expect.any(String),
        ctaLabel: expect.any(String),
        ctaHref: expect.any(String),
      },
      seo: {
        title: expect.any(String),
        description: expect.any(String),
      },
    });
  });

  it("keeps testimonials empty so fallback never invents social proof", () => {
    expect(homePageFallback.testimonials).toEqual([]);
  });

  it("preserves former ctaBanner copy on contactCta", () => {
    expect(homePageFallback.contactCta).toMatchObject({
      title: "Let’s build something meaningful.",
      ctaLabel: "Get in touch",
    });
  });
});
