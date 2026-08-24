/**
 * RFC — Sanity ↔ Frontend Align §1.1 Home
 * Studio field order: title → partners → portfolioItems → awards → testimonials → services → contactCta → seo
 */
import { describe, expect, it } from "vitest";

import { homePage } from "./homePage";

function fieldNames(type: typeof homePage): string[] {
  return (type.fields ?? []).map((field) => field.name);
}

function fieldByName(type: typeof homePage, name: string) {
  return (type.fields ?? []).find((field) => field.name === name);
}

describe("homePage schema (RFC §1.1 named fields)", () => {
  it("exposes named fields in Studio order (no blocks array)", () => {
    expect(fieldNames(homePage)).toEqual([
      "title",
      "partners",
      "portfolioItems",
      "awards",
      "testimonials",
      "services",
      "contactCta",
      "seo",
    ]);
  });

  it("partners / portfolioItems / awards / testimonials / services are reference arrays", () => {
    for (const name of [
      "partners",
      "portfolioItems",
      "awards",
      "testimonials",
      "services",
    ] as const) {
      const field = fieldByName(homePage, name);
      expect(field?.type).toBe("array");
    }

    const partnersOf = fieldByName(homePage, "partners") as {
      of?: Array<{ type?: string; to?: Array<{ type: string }> }>;
    };
    expect(partnersOf.of?.[0]?.type).toBe("reference");
    expect(partnersOf.of?.[0]?.to?.[0]?.type).toBe("partner");

    const portfolioOf = fieldByName(homePage, "portfolioItems") as {
      of?: Array<{ type?: string; to?: Array<{ type: string }> }>;
    };
    expect(portfolioOf.of?.[0]?.to?.[0]?.type).toBe("portfolio");

    const awardsOf = fieldByName(homePage, "awards") as {
      of?: Array<{ type?: string; to?: Array<{ type: string }> }>;
    };
    expect(awardsOf.of?.[0]?.to?.[0]?.type).toBe("award");

    const testimonialsOf = fieldByName(homePage, "testimonials") as {
      of?: Array<{ type?: string; to?: Array<{ type: string }> }>;
    };
    expect(testimonialsOf.of?.[0]?.type).toBe("reference");
    expect(testimonialsOf.of?.[0]?.to?.[0]?.type).toBe("testimonial");

    const servicesOf = fieldByName(homePage, "services") as {
      of?: Array<{ type?: string; to?: Array<{ type: string }> }>;
    };
    expect(servicesOf.of?.[0]?.to?.[0]?.type).toBe("service");
  });

  it("contactCta is an object with title, body, ctaLabel, ctaHref", () => {
    const contactCta = fieldByName(homePage, "contactCta") as {
      type?: string;
      fields?: Array<{ name: string }>;
      name?: string;
    };

    expect(contactCta?.type).toBe("object");
    expect((contactCta.fields ?? []).map((f) => f.name)).toEqual([
      "title",
      "body",
      "ctaLabel",
      "ctaHref",
    ]);
  });

  it("does not expose a blocks field", () => {
    expect(fieldNames(homePage)).not.toContain("blocks");
  });
});
