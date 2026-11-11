import { describe, expect, it } from "vitest";

import { buildPageMetadata } from "./metadata";

describe("buildPageMetadata", () => {
  it("builds title/description/canonical/OpenGraph/Twitter fields from route data", () => {
    const metadata = buildPageMetadata({
      title: "Services | Kamiyon Studio",
      description: "Our service categories.",
      path: "/services",
    });

    expect(metadata.title).toEqual({ absolute: "Services | Kamiyon Studio" });
    expect(metadata.description).toBe("Our service categories.");
    expect(metadata.alternates).toEqual({ canonical: "/services" });
    expect(metadata.robots).toBeUndefined();
    expect(metadata.openGraph).toMatchObject({
      title: "Services | Kamiyon Studio",
      description: "Our service categories.",
      url: "/services",
      siteName: "Kamiyon Studio",
      type: "website",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Services | Kamiyon Studio",
      description: "Our service categories.",
    });
  });

  it("provides a stable generated sharing image when CMS has none", () => {
    const metadata = buildPageMetadata({
      title: "Home",
      description: "Home page.",
      path: "/",
    });

    expect(metadata.openGraph?.images).toEqual([{ url: "/social-image" }]);
    expect(metadata.twitter?.images).toEqual(["/social-image"]);
  });

  it("sets robots noindex when noIndex is true (e.g. the 404 page)", () => {
    const metadata = buildPageMetadata({
      title: "Page not found",
      description: "Not found.",
      path: "/this-does-not-exist",
      noIndex: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("resolves a CMS ogImage into the OpenGraph/Twitter image URLs when present", () => {
    const metadata = buildPageMetadata({
      title: "Case Study",
      description: "A case study.",
      path: "/portfolio/sample",
      ogImage: { url: "/api/media/file/og.png" },
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: "/api/media/file/og.png" },
    ]);
    expect(metadata.twitter?.images).toEqual(["/api/media/file/og.png"]);
  });
});

it("brands an unbranded title once and identifies articles", () => {
  const metadata = buildPageMetadata({
    title: "A post",
    description: "News",
    path: "/blog/post",
    type: "article",
  });
  expect(metadata.title).toEqual({ absolute: "A post | Kamiyon Studio" });
  expect(metadata.openGraph).toMatchObject({
    type: "article",
    title: "A post | Kamiyon Studio",
  });
});
