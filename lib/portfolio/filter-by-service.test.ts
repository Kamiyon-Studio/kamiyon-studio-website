import { describe, expect, it } from "vitest";

import type { CaseStudy } from "@/lib/cms/types";
import {
  filterPortfolioByService,
  getAvailableServices,
} from "./filter-by-service";

function makeItem(serviceType: string, slug = serviceType): CaseStudy {
  return {
    _type: "portfolio",
    title: `${serviceType} project`,
    slug: { current: slug },
    clientName: "TBD",
    industry: "Education",
    serviceType,
    challenge: "",
    solution: "",
    impact: "",
    gallery: [],
    featured: false,
    isPlaceholder: true,
    seo: { title: "", description: "" },
  };
}

describe("getAvailableServices", () => {
  it("returns an empty array when there are no items", () => {
    expect(getAvailableServices([])).toEqual([]);
  });

  it("returns only Gate 0 services present in the items", () => {
    const items = [
      makeItem("game-development"),
      makeItem("branding", "brand-project"),
      makeItem("game-development", "game-2"),
    ];

    expect(getAvailableServices(items)).toEqual([
      "game-development",
      "branding",
    ]);
  });

  it("orders present services by Gate 0 taxonomy order, not first-seen", () => {
    const items = [
      makeItem("community-events"),
      makeItem("ui-design"),
      makeItem("product-development"),
    ];

    expect(getAvailableServices(items)).toEqual([
      "product-development",
      "ui-design",
      "community-events",
    ]);
  });

  it("ignores stale / unknown serviceType values as filter options", () => {
    const items = [
      makeItem("mvp-development"),
      makeItem("ui-ux-design"),
      makeItem("web-development"),
      makeItem("game-development"),
    ];

    expect(getAvailableServices(items)).toEqual(["game-development"]);
  });

  it("never surfaces removed standalone service titles as options", () => {
    const items = [
      makeItem("creative-services"),
      makeItem("consultation"),
      makeItem("blockchain-solutions"),
      makeItem("gamification"),
    ];

    expect(getAvailableServices(items)).toEqual([]);
  });
});

describe("filterPortfolioByService", () => {
  it("returns all items when the filter is 'all'", () => {
    const items = [makeItem("game-development"), makeItem("branding", "b")];

    expect(filterPortfolioByService(items, "all")).toEqual(items);
  });

  it("returns only items matching the given Gate 0 service", () => {
    const game = makeItem("game-development");
    const brand = makeItem("branding", "b");

    expect(filterPortfolioByService([game, brand], "branding")).toEqual([brand]);
  });

  it("returns an empty array when no items match", () => {
    expect(
      filterPortfolioByService([makeItem("game-development")], "branding")
    ).toEqual([]);
  });
});
