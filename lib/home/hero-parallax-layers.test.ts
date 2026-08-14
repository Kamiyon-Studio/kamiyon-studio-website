import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildHeroParallaxLayerKey,
  HERO_PARALLAX_BACKGROUND_FILE,
  HERO_PARALLAX_BRAND_Y_PERCENT,
  HERO_PARALLAX_KEY_PREFIX,
  HERO_PARALLAX_LAYER_HEIGHT,
  HERO_PARALLAX_LAYER_WIDTH,
  HERO_PARALLAX_LAYERS,
  HERO_PARALLAX_OBJECT_POSITION,
  HERO_PROJECTS_SEAM_SVH,
  heroParallaxVideoMaskStyle,
  heroProjectsSeamOverlayStyle,
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
  it("declares two plates ordered from furthest to nearest", () => {
    expect(HERO_PARALLAX_LAYERS.map((layer) => layer.depth)).toEqual([1, 2]);
  });

  it("versions the R2 prefix so a new stack can bust immutable CDN caches", () => {
    expect(HERO_PARALLAX_KEY_PREFIX).toBe("site/hero/parallax/v3");
  });

  it("uses the 1920×1080 plate geometry the stack is cropped to", () => {
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

  it("attaches MP4 only to the landscape video plate", () => {
    expect(HERO_PARALLAX_LAYERS[0]?.video).toEqual({ mp4: "homepage.mp4" });
    expect(HERO_PARALLAX_LAYERS[1]?.video).toBeUndefined();
  });

  it("pins the foreground plate so it can meet the projects section on scroll", () => {
    expect(HERO_PARALLAX_LAYERS[1]?.yPercent).toBe(0);
  });
});

describe("buildHeroParallaxLayerKey", () => {
  it("namespaces plates under a versioned prefix", () => {
    expect(buildHeroParallaxLayerKey("fallback.avif")).toBe(
      `${HERO_PARALLAX_KEY_PREFIX}/fallback.avif`,
    );
  });
});

describe("resolveHeroParallaxLayers", () => {
  it("resolves every plate to a public media URL", () => {
    const layers = resolveHeroParallaxLayers();

    expect(layers).not.toBeNull();
    expect(layers).toHaveLength(HERO_PARALLAX_LAYERS.length);
    expect(layers?.[0]?.src).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/fallback.avif`,
    );
    expect(layers?.[0]?.yPercent).toBe(HERO_PARALLAX_LAYERS[0]?.yPercent);
  });

  it("resolves the MP4 beside the freeze-frame for the video plate", () => {
    const layers = resolveHeroParallaxLayers();
    const video = layers?.[0];
    const foreground = layers?.[1];

    expect(video?.mp4Src).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/homepage.mp4`,
    );
    expect(video?.webmSrc).toBeUndefined();
    expect(foreground?.mp4Src).toBeUndefined();
    expect(foreground?.webmSrc).toBeUndefined();
  });

  it("works against the staging media host", () => {
    setBaseUrl("https://media-staging.kamiyonstudio.com");

    expect(resolveHeroParallaxLayers()?.[1]?.src).toBe(
      `https://media-staging.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/foreground.avif`,
    );
  });

  it("tolerates a trailing slash on the base URL", () => {
    setBaseUrl("https://media.kamiyonstudio.com/");

    expect(resolveHeroParallaxLayers()?.[0]?.src).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/fallback.avif`,
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
  it("uses the freeze-frame as an alpha mask when a plate needs one", () => {
    const src = "https://media.kamiyonstudio.com/site/hero/parallax/v3/fallback.avif";
    const style = heroParallaxVideoMaskStyle(src);

    expect(style.maskImage).toBe(`url("${src}")`);
    expect(style.WebkitMaskImage).toBe(`url("${src}")`);
    expect(style.maskMode).toBe("alpha");
    expect(style.maskSize).toBe("cover");
    expect(style.maskPosition).toBe("center top");
  });
});

describe("HERO_PARALLAX_OBJECT_POSITION", () => {
  it("pins the crop to the top of the viewport", () => {
    expect(HERO_PARALLAX_OBJECT_POSITION).toBe("center top");
  });
});

describe("HERO_PROJECTS_SEAM_SVH", () => {
  it("is a positive overlap so the cliff can hang into Recent Projects", () => {
    expect(HERO_PROJECTS_SEAM_SVH).toBeGreaterThan(0);
  });
});

describe("heroProjectsSeamOverlayStyle", () => {
  it("confines the charcoal dissolve to the hanging soil, not the first viewport", () => {
    const style = heroProjectsSeamOverlayStyle();
    expect(style.height).toBe(`${HERO_PROJECTS_SEAM_SVH}svh`);
    expect(style.backgroundImage).toContain("var(--color-charcoal)");
    expect(style.backgroundImage).toContain("transparent");
  });
});

describe("resolveHomeProjectsBackground", () => {
  it("resolves the earth plate for the Recent Projects section", () => {
    expect(HERO_PARALLAX_BACKGROUND_FILE).toBe("ground.avif");
    expect(resolveHomeProjectsBackground()).toBe(
      `https://media.kamiyonstudio.com/${HERO_PARALLAX_KEY_PREFIX}/ground.avif`,
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

    expect(behindBrand.map((layer) => layer.depth)).toEqual([1]);
    expect(inFrontOfBrand.map((layer) => layer.depth)).toEqual([2]);
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
