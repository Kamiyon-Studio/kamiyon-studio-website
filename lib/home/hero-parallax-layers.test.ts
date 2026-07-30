import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildHeroParallaxLayerKey,
  HERO_PARALLAX_BRAND_Y_PERCENT,
  HERO_PARALLAX_KEY_PREFIX,
  HERO_PARALLAX_LAYERS,
  resolveHeroParallaxLayers,
  splitHeroParallaxLayers,
} from "./hero-parallax-layers";

const ORIGINAL_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;

function setBaseUrl(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
    return;
  }
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = value;
}

beforeEach(() => {
  setBaseUrl("https://media.kamiyonstudio.com");
});

afterEach(() => {
  setBaseUrl(ORIGINAL_BASE_URL);
});

describe("HERO_PARALLAX_LAYERS", () => {
  it("declares four plates ordered from furthest to nearest", () => {
    expect(HERO_PARALLAX_LAYERS.map((layer) => layer.depth)).toEqual([1, 2, 3, 4]);
  });

  it("gives further plates more travel so they drift least on screen", () => {
    const travel = HERO_PARALLAX_LAYERS.map((layer) => layer.yPercent);
    const descending = [...travel].sort((a, b) => b - a);

    expect(travel).toEqual(descending);
  });

  it("uses distinct file names", () => {
    const files = HERO_PARALLAX_LAYERS.map((layer) => layer.file);
    expect(new Set(files).size).toBe(files.length);
  });
});

describe("buildHeroParallaxLayerKey", () => {
  it("namespaces plates under a versioned prefix", () => {
    expect(buildHeroParallaxLayerKey("layer-1.webp")).toBe(
      `${HERO_PARALLAX_KEY_PREFIX}/layer-1.webp`,
    );
  });
});

describe("resolveHeroParallaxLayers", () => {
  it("resolves every plate to a public media URL", () => {
    const layers = resolveHeroParallaxLayers();

    expect(layers).not.toBeNull();
    expect(layers).toHaveLength(HERO_PARALLAX_LAYERS.length);
    expect(layers?.[0]?.src).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/layer-1.webp`,
    );
    expect(layers?.[0]?.yPercent).toBe(HERO_PARALLAX_LAYERS[0]?.yPercent);
  });

  it("works against the staging media host", () => {
    setBaseUrl("https://media-staging.kamiyonstudio.com");

    expect(resolveHeroParallaxLayers()?.[3]?.src).toBe(
      `https://media-staging.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/layer-4.webp`,
    );
  });

  it("tolerates a trailing slash on the base URL", () => {
    setBaseUrl("https://media.kamiyonstudio.com/");

    expect(resolveHeroParallaxLayers()?.[0]?.src).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/layer-1.webp`,
    );
  });

  it("returns null when the media CDN is not configured", () => {
    setBaseUrl("");
    expect(resolveHeroParallaxLayers()).toBeNull();

    setBaseUrl(undefined);
    expect(resolveHeroParallaxLayers()).toBeNull();
  });

  it("returns null when the base URL is not an allowlisted next/image host", () => {
    setBaseUrl("https://untrusted.example.com");
    expect(resolveHeroParallaxLayers()).toBeNull();
  });

  it("returns null for an insecure base URL", () => {
    setBaseUrl("http://media.kamiyonstudio.com");
    expect(resolveHeroParallaxLayers()).toBeNull();
  });
});

describe("splitHeroParallaxLayers", () => {
  it("puts plates that travel further than the wordmark behind it", () => {
    const { behindBrand, inFrontOfBrand } = splitHeroParallaxLayers(
      HERO_PARALLAX_LAYERS,
    );

    expect(behindBrand.map((layer) => layer.depth)).toEqual([1, 2, 3]);
    expect(inFrontOfBrand.map((layer) => layer.depth)).toEqual([4]);
  });

  it("keeps every plate in exactly one group", () => {
    const { behindBrand, inFrontOfBrand } = splitHeroParallaxLayers(
      HERO_PARALLAX_LAYERS,
    );

    expect(behindBrand.length + inFrontOfBrand.length).toBe(
      HERO_PARALLAX_LAYERS.length,
    );
    expect(
      behindBrand.every((layer) => layer.yPercent > HERO_PARALLAX_BRAND_Y_PERCENT),
    ).toBe(true);
  });
});
