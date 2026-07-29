import { describe, expect, it } from "vitest";

import {
  extractSlug,
  tagsForSanityPayload,
  tagsForSanityType,
} from "./revalidate-tags";

describe("extractSlug", () => {
  it("reads string slugs", () => {
    expect(extractSlug("hello")).toBe("hello");
    expect(extractSlug("  ")).toBeNull();
  });

  it("reads Sanity slug objects", () => {
    expect(extractSlug({ current: "world" })).toBe("world");
    expect(extractSlug({ current: "" })).toBeNull();
  });
});

describe("tagsForSanityType", () => {
  it("always includes the shared sanity tag", () => {
    expect(tagsForSanityType("")).toEqual(["sanity"]);
    expect(tagsForSanityType("unknownType")).toEqual(["sanity"]);
  });

  it("maps singleton and collection types from queries.ts", () => {
    expect(tagsForSanityType("siteSettings")).toEqual(["sanity", "siteSettings"]);
    expect(tagsForSanityType("homePage")).toEqual(["sanity", "homePage"]);
    expect(tagsForSanityType("aboutPage")).toEqual(["sanity", "aboutPage"]);
    expect(tagsForSanityType("contactPage")).toEqual(["sanity", "contactPage"]);
    expect(tagsForSanityType("teamMember")).toEqual([
      "sanity",
      "teamMember",
      "post",
    ]);
    expect(tagsForSanityType("serviceCategory")).toEqual([
      "sanity",
      "serviceCategory",
    ]);
    expect(tagsForSanityType("communityItem")).toEqual(["sanity", "communityItem"]);
    expect(tagsForSanityType("partner")).toEqual(["sanity", "partner"]);
  });

  it("adds slug-scoped tags for service, product, portfolio, and post", () => {
    expect(tagsForSanityType("service", "branding")).toEqual([
      "sanity",
      "service",
      "service:branding",
    ]);
    expect(tagsForSanityType("product", "game-a")).toEqual([
      "sanity",
      "product",
      "product:game-a",
    ]);
    expect(tagsForSanityType("portfolio", "acme")).toEqual([
      "sanity",
      "portfolio",
      "portfolio:acme",
    ]);
    expect(tagsForSanityType("caseStudy", "acme")).toEqual([
      "sanity",
      "portfolio",
    ]);
    expect(tagsForSanityType("post", "launch")).toEqual([
      "sanity",
      "post",
      "post:launch",
    ]);
  });

  it("does not invent slug tags for non-scoped types", () => {
    expect(tagsForSanityType("homePage", "ignored")).toEqual(["sanity", "homePage"]);
  });

  it("maps blog support types to the post tag", () => {
    expect(tagsForSanityType("author")).toEqual(["sanity", "post"]);
    expect(tagsForSanityType("category")).toEqual(["sanity", "post"]);
    expect(tagsForSanityType("tag")).toEqual(["sanity", "post"]);
  });
});

describe("tagsForSanityPayload", () => {
  it("resolves type + nested slug from webhook bodies", () => {
    expect(
      tagsForSanityPayload({ _type: "post", slug: { current: "hello" } }),
    ).toEqual(["sanity", "post", "post:hello"]);
  });

  it("falls back to shared sanity tag when type is missing", () => {
    expect(tagsForSanityPayload({})).toEqual(["sanity"]);
  });
});
