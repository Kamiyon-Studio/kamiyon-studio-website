import { describe, expect, it } from "vitest";

import type { CaseStudy, Product } from "@/lib/cms/types";
import {
  OPENING_FALLBACK_IMAGE,
  OPENING_ITEM_LIMIT,
  buildOpeningItems,
  formatOpeningIndex,
} from "./opening-items";

function makeProduct(
  overrides: Omit<Partial<Product>, "slug"> & { slug: string }
): Product {
  const { slug, ...rest } = overrides;
  return {
    _type: "product",
    title: "Product",
    slug: { current: slug },
    tagline: "Tagline",
    genre: "Genre",
    status: "original-ip",
    developmentStatus: "tbd",
    overview: "",
    goals: [],
    features: [],
    platforms: [],
    media: [],
    isPlaceholder: true,
    order: 1,
    seo: { title: "", description: "" },
    ...rest,
  };
}

function makeCaseStudy(
  overrides: Omit<Partial<CaseStudy>, "slug"> & { slug: string }
): CaseStudy {
  const { slug, ...rest } = overrides;
  return {
    _type: "portfolio",
    title: "Case study",
    slug: { current: slug },
    clientName: "Client",
    industry: "Interactive",
  serviceType: "game-development",
    challenge: "",
    solution: "",
    impact: "",
    gallery: [],
    featured: false,
    isPlaceholder: true,
    seo: { title: "", description: "" },
    ...rest,
  };
}

describe("buildOpeningItems", () => {
  it("lists featured products before case studies and caps the count", () => {
    const products = [
      makeProduct({ slug: "eclipse", title: "Eclipse", genre: "Platformer" }),
      makeProduct({
        slug: "vocabu-wildlife-edition",
        title: "Vocabu",
        genre: "Educational",
      }),
    ];
    const caseStudies = [
      makeCaseStudy({
        slug: "sample",
        title: "Sample",
        clientName: "Client A",
      }),
    ];

    const items = buildOpeningItems({
      products,
      caseStudies,
      featuredProductSlugs: ["vocabu-wildlife-edition", "eclipse"],
      featuredCaseStudySlugs: ["sample"],
      limit: 3,
    });

    expect(items).toHaveLength(3);
    expect(items[0]?.id).toBe("product-vocabu-wildlife-edition");
    expect(items[1]?.id).toBe("product-eclipse");
    expect(items[2]?.id).toBe("case-sample");
    expect(items[0]?.href).toBe("/products/vocabu-wildlife-edition");
    expect(items[2]?.href).toBe("/portfolio/sample");
  });

  it("uses the shared fallback image when media is missing", () => {
    const items = buildOpeningItems({
      products: [makeProduct({ slug: "eclipse", title: "Eclipse" })],
      caseStudies: [],
    });

    expect(items[0]?.imageSrc).toBe(OPENING_FALLBACK_IMAGE);
    expect(OPENING_ITEM_LIMIT).toBe(5);
  });
});

describe("formatOpeningIndex", () => {
  it("zero-pads indexes like Il Capo project numbers", () => {
    expect(formatOpeningIndex(0)).toBe("01");
    expect(formatOpeningIndex(9)).toBe("10");
  });
});
