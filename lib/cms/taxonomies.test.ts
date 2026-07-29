import { describe, expect, it } from "vitest";

import {
  findTaxonomyTitle,
  isPostCategoryValue,
  isPostTagValue,
  isServiceCategoryValue,
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
});
