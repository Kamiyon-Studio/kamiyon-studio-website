/**
 * RFC — Sanity ↔ Frontend Align §4 Seed pre-fill (Home)
 */
import { describe, expect, it } from "vitest";

import { awardsFallback } from "@/lib/cms/fallbacks/awards";
import { homePageFallback } from "@/lib/cms/fallbacks/home";
import { portfolioItemsFallback } from "@/lib/cms/fallbacks/portfolio";
import { servicesFallback } from "@/lib/cms/fallbacks/services";
import { PARTNER_PLACEHOLDERS } from "@/lib/home/partner-placeholders";

import { buildHomePageDocument } from "./home";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

describe("home seed builder (RFC §4 named refs)", () => {
  it("emits named fields with references, not a blocks array", () => {
    const home = buildHomePageDocument();

    expect(home._id).toBe("homePage");
    expect(home._type).toBe("homePage");
    expect(home).not.toHaveProperty("blocks");
    expect(home).toHaveProperty("partners");
    expect(home).toHaveProperty("portfolioItems");
    expect(home).toHaveProperty("awards");
    expect(home).toHaveProperty("services");
    expect(home).toHaveProperty("contactCta");
    expect(home).toHaveProperty("seo");
  });

  it("pre-fills refs for all partners, portfolio, awards, and five Gate 0 services", () => {
    const home = buildHomePageDocument();

    expect(home.partners).toEqual(
      PARTNER_PLACEHOLDERS.map((p, i) => ({
        _type: "reference",
        _ref: `partner-${p.id}`,
        _key: `partner-${i}`,
      })),
    );

    expect(home.portfolioItems).toEqual(
      portfolioItemsFallback.map((item, i) => ({
        _type: "reference",
        _ref: `portfolio-${item.slug.current}`,
        _key: `portfolio-${i}`,
      })),
    );

    expect(home.awards).toEqual(
      awardsFallback.map((_, i) => ({
        _type: "reference",
        _ref: `award-slot-${i + 1}`,
        _key: `award-${i}`,
      })),
    );

    expect(home.services).toEqual(
      servicesFallback.map((s, i) => ({
        _type: "reference",
        _ref: `service-${s.slug.current}`,
        _key: `service-${i}`,
      })),
    );
    expect((home.services as unknown[]).length).toBe(5);
    expect(home.testimonials).toEqual([]);
  });

  it("emits an empty testimonials array with no testimonial documents or invented quotes", () => {
    const home = buildHomePageDocument();
    const serialized = JSON.stringify(home);

    expect(home.testimonials).toEqual([]);
    expect(serialized).not.toMatch(/"_type":"testimonial"/);
    expect(serialized).not.toMatch(/"quote":/);
  });

  it("copies contactCta from home fallback (former ctaBanner copy)", () => {
    const home = buildHomePageDocument();
    const cta = home.contactCta;

    expect(isRecord(cta)).toBe(true);
    expect(cta).toMatchObject({
      title: homePageFallback.contactCta.title,
      body: homePageFallback.contactCta.body,
      ctaLabel: homePageFallback.contactCta.ctaLabel,
      ctaHref: homePageFallback.contactCta.ctaHref,
    });
    expect(cta).not.toHaveProperty("_type", "ctaBanner");
  });

  it("does not emit a hero block", () => {
    const home = buildHomePageDocument();
    const serialized = JSON.stringify(home);
    expect(serialized).not.toMatch(/"_type":"hero"/);
    expect(home).not.toHaveProperty("blocks");
  });
});
