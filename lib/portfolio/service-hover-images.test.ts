import { describe, expect, it } from "vitest";

import type { Portfolio } from "@/lib/cms/types";

import { pickServiceHoverImages } from "./service-hover-images";

const CDN = "https://media.kamiyonstudio.com";

function makeItem(
  overrides: Partial<Portfolio> & Pick<Portfolio, "serviceType" | "slug">,
): Portfolio {
  return {
    _type: "portfolio",
    title: overrides.title ?? `${overrides.serviceType} project`,
    slug: overrides.slug,
    clientName: "TBD",
    industry: "Games",
    serviceType: overrides.serviceType,
    projectType: "client-work",
    shortDescription: "",
    challenge: "",
    solution: "",
    impact: "",
    credits: [],
    recognition: [],
    videos: [],
    externalLinks: [],
    gallery: [],
    featured: false,
    isPlaceholder: false,
    seo: { title: "", description: "" },
    ...overrides,
  };
}

describe("pickServiceHoverImages", () => {
  it("returns undefined when no matching project has photos", () => {
    const items = [
      makeItem({
        serviceType: "branding",
        slug: { current: "brand-a" },
      }),
      makeItem({
        serviceType: "game-development",
        slug: { current: "game-no-photos" },
      }),
    ];

    expect(pickServiceHoverImages(items, "game-development")).toBeUndefined();
    expect(pickServiceHoverImages(items, "ui-design")).toBeUndefined();
  });

  it("skips placeholder projects even when they have photos", () => {
    const items = [
      makeItem({
        serviceType: "game-development",
        slug: { current: "placeholder" },
        isPlaceholder: true,
        coverImage: { url: `${CDN}/placeholder.png`, alt: "Placeholder" },
      }),
    ];

    expect(pickServiceHoverImages(items, "game-development")).toBeUndefined();
  });

  it("uses cover then gallery photos from a project with the matching service tag", () => {
    const items = [
      makeItem({
        serviceType: "branding",
        slug: { current: "brand-a" },
        coverImage: { url: `${CDN}/brand-cover.png`, alt: "Brand cover" },
      }),
      makeItem({
        title: "Eclipse",
        serviceType: "game-development",
        slug: { current: "eclipse" },
        coverImage: { url: `${CDN}/eclipse-cover.png`, alt: "Eclipse cover" },
        gallery: [
          { url: `${CDN}/eclipse-1.png`, alt: "Eclipse shot 1" },
          { url: `${CDN}/eclipse-2.png`, alt: "Eclipse shot 2" },
        ],
      }),
    ];

    expect(pickServiceHoverImages(items, "game-development")).toEqual([
      { src: `${CDN}/eclipse-cover.png`, alt: "Eclipse cover" },
      { src: `${CDN}/eclipse-1.png`, alt: "Eclipse shot 1" },
    ]);
  });

  it("duplicates the only available photo so the reveal pair is complete", () => {
    const items = [
      makeItem({
        title: "Solo shot",
        serviceType: "ui-design",
        slug: { current: "solo" },
        gallery: [{ url: `${CDN}/only.png`, alt: "Only shot" }],
      }),
    ];

    expect(pickServiceHoverImages(items, "ui-design")).toEqual([
      { src: `${CDN}/only.png`, alt: "Only shot" },
      { src: `${CDN}/only.png`, alt: "Only shot" },
    ]);
  });

  it("falls back to the project title when a photo has no alt", () => {
    const items = [
      makeItem({
        title: "Eclipse",
        serviceType: "game-development",
        slug: { current: "eclipse" },
        coverImage: { url: `${CDN}/eclipse.png` },
      }),
    ];

    expect(pickServiceHoverImages(items, "game-development")?.[0].alt).toBe(
      "Eclipse",
    );
  });

  it("ignores photos that are not on the allowlisted media CDN", () => {
    const items = [
      makeItem({
        serviceType: "game-development",
        slug: { current: "itch" },
        coverImage: {
          url: "https://kamiyon-studio.itch.io/eclipse",
          alt: "Itch page",
        },
      }),
    ];

    expect(pickServiceHoverImages(items, "game-development")).toBeUndefined();
  });
});
