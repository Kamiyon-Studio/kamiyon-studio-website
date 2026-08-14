import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildHeroParallaxLayerKey,
  HERO_PARALLAX_BACKGROUND_FILE,
  HERO_PARALLAX_BRAND_Y_PERCENT,
  HERO_PARALLAX_KEY_PREFIX,
  HERO_PARALLAX_LAYER_HEIGHT,
  HERO_PARALLAX_LAYER_WIDTH,
  HERO_PARALLAX_LAYERS,
  heroParallaxVideoMaskStyle,
  resolveHomeProjectsBackground,
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

  it("versions the R2 prefix so a new stack can bust immutable CDN caches", () => {
    expect(HERO_PARALLAX_KEY_PREFIX).toBe("site/hero/parallax/v2");
  });

  it("uses the 1920×1080 plate geometry the new exports share", () => {
    expect(HERO_PARALLAX_LAYER_WIDTH).toBe(1920);
    expect(HERO_PARALLAX_LAYER_HEIGHT).toBe(1080);
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

  it("attaches WebM+MP4 only to the sky and ocean plates", () => {
    expect(HERO_PARALLAX_LAYERS[0]?.video).toEqual({
      webm: "layer-1.webm",
      mp4: "layer-1.mp4",
    });
    expect(HERO_PARALLAX_LAYERS[1]?.video).toBeUndefined();
    expect(HERO_PARALLAX_LAYERS[2]?.video).toEqual({
      webm: "layer-3.webm",
      mp4: "layer-3.mp4",
    });
    expect(HERO_PARALLAX_LAYERS[3]?.video).toBeUndefined();
  });

  it("pins the foreground plate so it can meet the projects section on scroll", () => {
    expect(HERO_PARALLAX_LAYERS[3]?.yPercent).toBe(0);
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

  it("resolves video URLs beside the freeze-frame for motion plates", () => {
    const layers = resolveHeroParallaxLayers();
    const sky = layers?.[0];
    const mountain = layers?.[1];
    const ocean = layers?.[2];

    expect(sky?.webmSrc).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/layer-1.webm`,
    );
    expect(sky?.mp4Src).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/layer-1.mp4`,
    );
    expect(ocean?.webmSrc).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/layer-3.webm`,
    );
    expect(ocean?.mp4Src).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/layer-3.mp4`,
    );
    expect(mountain?.webmSrc).toBeUndefined();
    expect(mountain?.mp4Src).toBeUndefined();
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

describe("heroParallaxVideoMaskStyle", () => {
  it("uses the WebP freeze-frame as an alpha mask so black video pixels cannot cover deeper plates", () => {
    const src = "https://media.kamiyonstudio.com/site/hero/parallax/v2/layer-3.webp";
    const style = heroParallaxVideoMaskStyle(src);

    expect(style.maskImage).toBe(`url("${src}")`);
    expect(style.WebkitMaskImage).toBe(`url("${src}")`);
    expect(style.maskMode).toBe("alpha");
    expect(style.maskSize).toBe("cover");
    expect(style.maskPosition).toBe("center 62%");
  });
});

describe("resolveHomeProjectsBackground", () => {
  it("resolves the earth plate for the Recent Projects section", () => {
    expect(HERO_PARALLAX_BACKGROUND_FILE).toBe("background.webp");
    expect(resolveHomeProjectsBackground()).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/background.webp`,
    );
  });

  it("returns null when the media CDN is not configured", () => {
    setBaseUrl("");
    expect(resolveHomeProjectsBackground()).toBeNull();
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
