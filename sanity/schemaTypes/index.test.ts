import { describe, expect, it } from "vitest";

import {
  CANONICAL_SERVICE_SLUGS,
  CANONICAL_SERVICES,
  SANITY_ARCHIVED_TYPES,
  SANITY_DOCUMENT_TYPES,
  SANITY_OBJECT_TYPES,
} from "./constants";

describe("sanity schema constants", () => {
  it("lists all required document types from essential context §7", () => {
    expect(SANITY_DOCUMENT_TYPES).toEqual([
      "siteSettings",
      "homePage",
      "aboutPage",
      "contactPage",
      "teamMember",
      "serviceCategory",
      "service",
      "product",
      "portfolio",
      "caseStudy",
      "communityItem",
      "partner",
      "mediaAsset",
      "author",
      "category",
      "tag",
      "post",
    ]);
  });

  it("lists archived types under SANITY_ARCHIVED_TYPES", () => {
    expect(SANITY_ARCHIVED_TYPES).toEqual([
      "product",
      "communityItem",
      "caseStudy",
      "serviceCategory",
      "category",
      "tag",
      "author",
      "mediaAsset",
    ]);
  });

  it("defines Gate 0 canonical services (exactly five, fixed order)", () => {
    expect(CANONICAL_SERVICES).toHaveLength(5);
    expect(CANONICAL_SERVICE_SLUGS).toEqual([
      "game-development",
      "product-development",
      "ui-design",
      "branding",
      "community-events",
    ]);
  });

  it("lists shared object types used across schemas", () => {
    expect(SANITY_OBJECT_TYPES).toContain("r2Asset");
    expect(SANITY_OBJECT_TYPES).toContain("seoMetadata");
    expect(SANITY_OBJECT_TYPES).toContain("portableBody");
    expect(SANITY_OBJECT_TYPES).toContain("blogBody");
    expect(SANITY_OBJECT_TYPES).toContain("hero");
    expect(SANITY_OBJECT_TYPES).toContain("storyTimelineEntry");
  });

  it("uses unique document type names", () => {
    expect(new Set(SANITY_DOCUMENT_TYPES).size).toBe(SANITY_DOCUMENT_TYPES.length);
  });

  it("uses unique object type names", () => {
    expect(new Set(SANITY_OBJECT_TYPES).size).toBe(SANITY_OBJECT_TYPES.length);
  });
});
