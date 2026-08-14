import { describe, expect, it } from "vitest";

import {
  findTaxonomyTitle,
  isPortfolioLinkKind,
  isPortfolioProjectType,
  isPortfolioStatus,
  isPostCategoryValue,
  isPostTagValue,
  isServiceCategoryValue,
  PORTFOLIO_LINK_KINDS,
  PORTFOLIO_PROJECT_TYPES,
  PORTFOLIO_STATUSES,
  POST_CATEGORIES,
  POST_TAGS,
  SERVICE_CATEGORIES,
  toSanityListOptions,
} from "./taxonomies";

function assertUniqueValues(options: readonly { value: string }[]) {
  const values = options.map((option) => option.value);
  expect(new Set(values).size).toBe(values.length);
}

describe("SERVICE_CATEGORIES", () => {
  it("has unique values and non-empty titles", () => {
    assertUniqueValues(SERVICE_CATEGORIES);
    for (const option of SERVICE_CATEGORIES) {
      expect(option.title.trim().length).toBeGreaterThan(0);
      expect(option.description?.trim().length).toBeGreaterThan(0);
    }
  });

  it("matches Gate 0 five-service order (ADR-016)", () => {
    expect(SERVICE_CATEGORIES.map((o) => o.value)).toEqual([
      "game-development",
      "product-development",
      "ui-design",
      "branding",
      "community-events",
    ]);
  });
});

describe("POST_CATEGORIES", () => {
  it("has unique values and non-empty titles", () => {
    assertUniqueValues(POST_CATEGORIES);
    for (const option of POST_CATEGORIES) {
      expect(option.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("includes the updates category from blog seed", () => {
    expect(POST_CATEGORIES.map((o) => o.value)).toEqual(["updates"]);
  });
});

describe("PORTFOLIO_PROJECT_TYPES", () => {
  it("covers original-ip and client-work only", () => {
    expect(PORTFOLIO_PROJECT_TYPES.map((o) => o.value)).toEqual([
      "original-ip",
      "client-work",
    ]);
  });
});

describe("PORTFOLIO_STATUSES", () => {
  it("covers prototype through archived", () => {
    expect(PORTFOLIO_STATUSES.map((o) => o.value)).toEqual([
      "prototype",
      "in-development",
      "released",
      "archived",
    ]);
  });
});

describe("PORTFOLIO_LINK_KINDS", () => {
  it("does not invent storefront kinds beyond the lean list", () => {
    expect(PORTFOLIO_LINK_KINDS.map((o) => o.value)).toEqual([
      "website",
      "trailer",
      "store",
      "press",
      "source",
      "other",
    ]);
    expect(PORTFOLIO_LINK_KINDS.map((o) => o.value)).not.toContain("steam");
  });
});

describe("POST_TAGS", () => {
  it("has unique values and non-empty titles", () => {
    assertUniqueValues(POST_TAGS);
    for (const option of POST_TAGS) {
      expect(option.title.trim().length).toBeGreaterThan(0);
    }
  });

  it("includes coming-soon and announcement from blog seed", () => {
    expect(POST_TAGS.map((o) => o.value)).toEqual([
      "coming-soon",
      "announcement",
    ]);
  });
});

describe("toSanityListOptions", () => {
  it("maps to title/value pairs for Studio options.list", () => {
    expect(toSanityListOptions(POST_TAGS)).toEqual([
      { title: "Coming soon", value: "coming-soon" },
      { title: "Announcement", value: "announcement" },
    ]);
  });
});

describe("findTaxonomyTitle", () => {
  it("returns the title for a known value", () => {
    expect(findTaxonomyTitle(SERVICE_CATEGORIES, "branding")).toBe("Branding");
  });

  it("returns undefined for an unknown value", () => {
    expect(findTaxonomyTitle(SERVICE_CATEGORIES, "missing")).toBeUndefined();
  });
});

describe("type guards", () => {
  it("narrows service category values", () => {
    expect(isServiceCategoryValue("game-development")).toBe(true);
    expect(isServiceCategoryValue("nope")).toBe(false);
  });

  it("narrows post category and tag values", () => {
    expect(isPostCategoryValue("updates")).toBe(true);
    expect(isPostCategoryValue("news")).toBe(false);
    expect(isPostTagValue("coming-soon")).toBe(true);
    expect(isPostTagValue("draft")).toBe(false);
  });

  it("narrows portfolio project type, status, and link kind", () => {
    expect(isPortfolioProjectType("original-ip")).toBe(true);
    expect(isPortfolioProjectType("client-work")).toBe(true);
    expect(isPortfolioProjectType("product")).toBe(false);
    expect(isPortfolioStatus("in-development")).toBe(true);
    expect(isPortfolioStatus("live")).toBe(false);
    expect(isPortfolioLinkKind("website")).toBe(true);
    expect(isPortfolioLinkKind("demo")).toBe(false);
  });
});
